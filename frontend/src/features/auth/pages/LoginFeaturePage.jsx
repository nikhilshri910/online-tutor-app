import LoginFormCard from "../components/LoginFormCard";
import { loginFormFields } from "../config/loginForm";
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginFeaturePage() {
  const { form, setField, submitting, submit } = useLoginForm();

  return (
    <div className="page-center">
      <LoginFormCard
        title="Login"
        fields={loginFormFields}
        value={form}
        onChange={setField}
        onSubmit={submit}
        submitting={submitting}
      />
    </div>
  );
}
