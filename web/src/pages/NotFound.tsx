import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-9xl font-bold gradient-text-primary mb-4">
            404
          </div>
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
            {location.pathname.includes("/settlement/") && (
              <span className="block mt-2 text-sm">
                If you're looking for a settlement, make sure you have the
                correct ID.
              </span>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="gap-2 gradient-bg-primary"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/import")}
              >
                Create Settlement
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/analytics")}
              >
                Analytics
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/how-it-works")}
              >
                How It Works
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
