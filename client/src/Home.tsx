import { useEffect } from "react";
import { getUserData, signIn } from "./api/user.api";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserData("0384faf7-47a3-451a-9978-5adfcc728972");
      console.log(data);
    };

    const handleSignIn = async () => {
      const data = await signIn("test@gmail.com", "furkan");
      console.log(data.data)
    };
    fetchData();
    handleSignIn();
  }, []);
  return <div>Home</div>;
}
