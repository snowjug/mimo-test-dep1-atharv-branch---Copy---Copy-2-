# FastAPI Server Fix for Page Selection and Duplex

## Problem
The FastAPI server is using CUPS's `page-ranges` option, which many printers (including Brother printers) don't support. This causes all pages to be printed instead of just the selected pages.

## Solution
Extract pages from the PDF **before** sending it to CUPS using `pdftk` or `qpdf`.

## Updated Code

Replace the `/print` endpoint in `main.py` with this updated version:

```python
@app.post("/print")
async def print_document(
    file: UploadFile = File(...),
    settings: str = Form(
        '{"copies":1,"orientation":"portrait","color":true,"duplex":false,"paperSize":"A4"}'
    ),
):
    """
    Upload a document + JSON settings and enqueue a print job.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing upload file")

    # Parse print settings JSON
    try:
        parsed = PrintSettings.model_validate_json(settings)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    suffix = os.path.splitext(file.filename)[1].lower()
    temp_file = f"/tmp/{uuid.uuid4().hex}{suffix}"
    converted_pdf: Optional[str] = None
    final_path: Optional[str] = None
    extracted_pdf: Optional[str] = None  # For page extraction

    try:
        # Save uploaded file to /tmp
        raw = await file.read()
        if not raw:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        with open(temp_file, "wb") as tmp:
            tmp.write(raw)

        # Convert to PDF if needed
        if suffix in SUPPORTED_DIRECT_SEND:
            converted_pdf = temp_file
        elif suffix in (SUPPORTED_OFFICE | SUPPORTED_IMAGES | SUPPORTED_TEXT):
            converted_pdf = convert_to_pdf(temp_file, suffix)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format."
            )

        # Extract pages if specified (BEFORE printing)
        final_path = converted_pdf
        if parsed.pages and converted_pdf and converted_pdf.lower().endswith(".pdf"):
            try:
                # Create temp file for extracted pages
                extracted_pdf = f"/tmp/{uuid.uuid4().hex}.pdf"
                
                # Convert page range to pdftk format
                # "1-3" -> "1-3", "1-3,5,7-9" -> "1-3 5 7-9"
                page_ranges = parsed.pages.replace(',', ' ')
                
                # Try pdftk first
                try:
                    result = subprocess.run(
                        ['pdftk', converted_pdf, 'cat', page_ranges, 'output', extracted_pdf],
                        capture_output=True,
                        text=True,
                        timeout=30,
                        check=True
                    )
                    final_path = extracted_pdf
                    print(f"✓ Extracted pages {parsed.pages} using pdftk")
                except (subprocess.CalledProcessError, FileNotFoundError):
                    # Fallback to qpdf
                    try:
                        # Convert to qpdf format (0-indexed)
                        def parse_page_range(page_str):
                            pages_list = []
                            for part in page_str.split(','):
                                part = part.strip()
                                if '-' in part:
                                    start, end = map(int, part.split('-'))
                                    pages_list.extend(range(start - 1, end))
                                else:
                                    pages_list.append(int(part) - 1)
                            return ','.join(map(str, sorted(set(pages_list))))
                        
                        qpdf_pages = parse_page_range(parsed.pages)
                        result = subprocess.run(
                            ['qpdf', '--empty', '--pages', converted_pdf, qpdf_pages, '--', extracted_pdf],
                            capture_output=True,
                            text=True,
                            timeout=30,
                            check=True
                        )
                        final_path = extracted_pdf
                        print(f"✓ Extracted pages {parsed.pages} using qpdf")
                    except (subprocess.CalledProcessError, FileNotFoundError) as e:
                        print(f"⚠ Both pdftk and qpdf failed: {e}, printing all pages")
                        if os.path.exists(extracted_pdf):
                            os.remove(extracted_pdf)
                        extracted_pdf = None
            except Exception as e:
                print(f"⚠ Error extracting pages: {e}, printing all pages")
                if extracted_pdf and os.path.exists(extracted_pdf):
                    os.remove(extracted_pdf)
                extracted_pdf = None

        # Count pages in the final PDF
        total_pages = None
        if final_path and final_path.lower().endswith(".pdf"):
            total_pages = get_pdf_page_count(final_path)

        # Build CUPS options (REMOVE page-ranges - we already extracted pages)
        options = build_cups_options(parsed)
        # Remove page-ranges since we extracted pages already
        options.pop("page-ranges", None)
        
        printer = get_printer_name()
        job_id = conn.printFile(printer, final_path, file.filename, options)

        # Store meta info
        JOB_META[job_id] = {
            "total_pages": total_pages,
            "file_name": file.filename,
        }

    except (RuntimeError, subprocess.CalledProcessError, ValueError) as e:
        raise HTTPException(status_code=500, detail=str(e))
    except cups.IPPError as e:
        raise HTTPException(status_code=500, detail=f"CUPS IPP error: {e}")
    finally:
        # Clean up temp files
        for path in {temp_file, converted_pdf, extracted_pdf}:
            if path and path != temp_file and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass

    return {
        "status": "queued",
        "job_id": job_id,
        "printer": printer,
        "settings": parsed.model_dump(),
        "total_pages": total_pages,
    }
```

## Also Update `build_cups_options` Function

Remove the `page-ranges` option since we extract pages before printing:

```python
def build_cups_options(settings: PrintSettings) -> Dict[str, str]:
    """Translate our JSON settings into CUPS options."""
    options: Dict[str, str] = {}

    # Color / B&W
    options["print-color-mode"] = "color" if settings.color else "monochrome"

    # Duplex
    options["sides"] = "two-sided-long-edge" if settings.duplex else "one-sided"

    # Orientation (IPP: 3 = portrait, 4 = landscape)
    options["orientation-requested"] = "3" if settings.orientation == Orientation.portrait else "4"

    # Paper size
    options["media"] = map_paper_size_to_media(settings.paperSize)

    # Copies
    if settings.copies != 1:
        options["copies"] = str(settings.copies)

    # NOTE: page-ranges is removed - we extract pages BEFORE printing

    return options
```

## Required Dependencies

Make sure `pdftk` or `qpdf` is installed on the Raspberry Pi:

```bash
# Install pdftk
sudo apt-get update
sudo apt-get install pdftk

# OR install qpdf
sudo apt-get install qpdf
```

## Testing

After updating the code:

1. Restart the FastAPI server
2. Try printing with page selection (e.g., pages "1-3")
3. Check that only the selected pages are printed
4. Verify duplex printing works

## Key Changes

1. **Extract pages BEFORE printing**: Use `pdftk` or `qpdf` to extract selected pages into a new PDF file
2. **Remove `page-ranges` from CUPS options**: Since we extract pages before printing, we don't need CUPS to handle page ranges
3. **Proper cleanup**: Clean up all temporary files (original, converted, extracted)
4. **Error handling**: If page extraction fails, fall back to printing all pages

