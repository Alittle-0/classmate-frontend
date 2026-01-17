import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const Logout = () => {
  const { logOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      onClick={handleLogOut}
      className="bg-foreground text-background hover:bg-background hover:text-foreground hover:border-foreground border-2 border-foreground"
    >
      Logout
    </Button>
  );
};

export default Logout;
