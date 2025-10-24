import LoginForm from "@/components/LoginForm";
import {auth} from "@/lib/firebase";
export default function Page() {
    return <LoginForm />;
}
console.log("Firebase initialized:", auth);
