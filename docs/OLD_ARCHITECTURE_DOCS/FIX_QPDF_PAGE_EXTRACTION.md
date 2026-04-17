# Fix for qpdf Page Extraction Error

## Problem

The server logs show:
```
⚠ Both pdftk and qpdf failed: Command '['qpdf', '--empty', '--pages', '/tmp/...pdf', '0,2,4,6,8,10,12', '--', '/tmp/...pdf']' returned non-zero exit status 2.
```

The issue is that the qpdf command is using 0-indexed page numbers, but qpdf expects 1-indexed pages.

## Solution

I've updated the `extract_pdf_pages` function to:
1. Try pdftk first (uses 1-indexed pages directly)
2. If pdftk fails, try qpdf with the original page string (1-indexed)
3. If that fails, try qpdf with z-format (zero-indexed alternative syntax)

## Testing

To test if the tools are installed:

```bash
# Check if pdftk is installed
which pdftk
pdftk --version

# Check if qpdf is installed
which qpdf
qpdf --version
```

If neither is installed:

```bash
# Install pdftk
sudo apt-get update
sudo apt-get install pdftk

# OR install qpdf
sudo apt-get install qpdf
```

## Manual Test

Test page extraction manually:

```bash
# Test with pdftk
pdftk input.pdf cat 1-3,5,7-9 output output.pdf

# Test with qpdf (direct format)
qpdf --empty --pages input.pdf 1-3,5,7-9 -- output.pdf

# Test with qpdf (z-format, zero-indexed)
qpdf --empty --pages input.pdf z0-2,z4,z6-8 -- output.pdf
```

## Updated Code

The fixed `extract_pdf_pages` function now:
- Uses the original page string (1-indexed) directly with qpdf
- Falls back to z-format if direct format fails
- Provides better error messages showing what failed

