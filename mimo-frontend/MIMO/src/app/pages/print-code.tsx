import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Copy, CheckCircle } from "lucide-react";
import { MimoHeader } from "../components/mimo-header";
import { toast } from "sonner";

export function PrintCode() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);

  const [printCode, setPrintCode] = useState<string | null>(null);

  useEffect(() => {
  const code = sessionStorage.getItem("printPin") || sessionStorage.getItem("printCode");

  console.log("Loaded printCode:", code);

  if (!code) {
    toast.error("No print code found");
    navigate("/");
    return;
  }

  setPrintCode(code);
}, [navigate]);


  const handleDone = () => {
  sessionStorage.removeItem("printCode");
  sessionStorage.removeItem("printPin");
  navigate("/");
};

  return (
    <>
      <style>
        {`
          @keyframes slideUpPaper {
            0% { transform: translateY(50px); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes scaleCheck {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-slide-up-paper {
            animation: slideUpPaper 1.2s ease-out forwards;
          }
          .animate-scale-check {
            animation: scaleCheck 0.4s ease-out cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}
      </style>

      <div className="min-h-screen w-full flex flex-col p-4 sm:p-6 bg-slate-50/50 relative">

        {/* Header */}
        <div className="w-full max-w-6xl mx-auto mb-4 sm:mb-8 z-10">
          <MimoHeader />
        </div>

        <Card className="max-w-2xl w-full mx-auto border-0 shadow-2xl bg-white/90 backdrop-blur-xl animate-in zoom-in-95 duration-500 z-10 my-auto">
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mt-8 mb-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                
                {/* Printer Base */}
                <div className="absolute bottom-4 w-28 h-16 bg-[#093765] rounded-xl flex items-center justify-center shadow-lg z-20">
                  <Copy className="w-8 h-8 text-white/80" />
                </div>

                {/* Paper Animation */}
                <div className="absolute bottom-16 w-16 h-20 bg-white border border-gray-200 shadow-sm rounded-t animate-slide-up-paper z-10 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1 animate-scale-check" style={{ animationDelay: '0.8s' }}>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="w-10 h-1 bg-gray-100 rounded-full mb-1"></div>
                  <div className="w-8 h-1 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>

            <CardTitle className="text-3xl font-bold mb-2 text-gray-900">
              Payment Successful!
            </CardTitle>

            <CardDescription className="text-base">
              Your print job has been confirmed. Use the code below at the printer.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Print Code Section */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-100 rounded-3xl p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Copy className="w-32 h-32 rotate-[-15deg]" />
              </div>

              <p className="text-center text-sm font-medium text-gray-600 mb-3">
                Your Print Code
              </p>

              <div className="text-center space-y-6">
                {!printCode ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <p className="text-5xl font-bold">{printCode}</p>
              )}
                </div>
              </div>

            {/* Instructions */}
            <Card className="bg-blue-50/50 border-blue-100 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <Copy className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How to Print</h3>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>Go to the MIMO vending printer</li>
                      <li>Enter the 4-digit code on the printer's keypad</li>
                      <li>Press the "Print" button</li>
                      <li>Collect your documents</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action */}
            <div className="pt-4">
              <Button
                className="w-full h-12 bg-gradient-to-r from-[#093765] to-blue-700 hover:from-[#052345] hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleDone}
              >
                Need more prints?
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
}