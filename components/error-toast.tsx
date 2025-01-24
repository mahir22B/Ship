import { useSandpack } from "@codesandbox/sandpack-react/unstyled";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { submitError } from '../store/slices/errorSlice';
import type { AppDispatch, RootState } from '../store';


export const ErrorToast = () => {
    const { sandpack: { error }  } = useSandpack();
    const [showError, setShowError] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { submitting } = useSelector((state: RootState) => state.error);
  
    useEffect(() => {
      if (error) {
        setShowError(true);
      }
    }, [error]);
  
    if (!showError || !error) return null;

    const handleErrorSubmit = async () => {
        try {
          await dispatch(submitError(error.message)).unwrap();
          console.log("Error submitted successfully");
          setShowError(false);
        } catch (err) {
          console.error("Failed to submit error:", err);
        }
      };
  
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-96 bg-black shadow-lg">
          <CardContent className="p-4">
            <div className="font-semibold text-red-600 mb-2">
              {"Oops, there's an error"}
            </div>
            <div className="mt-2 space-y-4">
              <p className="text-sm text-white">{error.message}</p>
              <div className="flex gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleErrorSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Try to Fix it'}
              </Button>
                <Button
                  onClick={() => {
                    console.log("Closed");
                    setShowError(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };