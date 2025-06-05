
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page should not be reached since we're using Dashboard as the index
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
