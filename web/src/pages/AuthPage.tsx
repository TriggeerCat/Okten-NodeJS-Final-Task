import { useState } from "react";
import { Navigate } from "react-router";
import { useAction } from "../api";
import { useAuth } from "../auth";
import { Alert, Button, Card, Field, Input } from "../components/ui";

type Mode = "sign-in" | "sign-up" | "dealer";

const titles: Record<Mode, string> = {
    "sign-in": "Sign in",
    "sign-up": "Create account",
    dealer: "Register a dealership"
};

export function AuthPage() {
    const { user, signIn, signUp } = useAuth();
    const action = useAction();
    const [mode, setMode] = useState<Mode>("sign-in");
    const [form, setForm] = useState({ name: "", email: "", password: "", tenant: "" });

    if (user) return <Navigate to="/" replace />;

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value });

    return (
        <div className="mx-auto max-w-md">
            <div className="mb-4 flex gap-1 rounded-lg bg-white p-1 shadow-sm">
                {(Object.keys(titles) as Mode[]).map((item) => (
                    <button
                        key={item}
                        className={`flex-1 rounded-md py-1.5 text-sm ${mode === item ? "bg-blue-600 text-white" : "text-slate-600"}`}
                        onClick={() => setMode(item)}
                    >
                        {titles[item]}
                    </button>
                ))}
            </div>
            <Card title={titles[mode]}>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        action.run(() =>
                            mode === "sign-in"
                                ? signIn(form.email, form.password)
                                : signUp({
                                      name: form.name,
                                      email: form.email,
                                      password: form.password,
                                      ...(mode === "dealer" ? { tenant: form.tenant } : {})
                                  })
                        );
                    }}
                >
                    {mode !== "sign-in" && (
                        <Field label="Name">
                            <Input value={form.name} onChange={set("name")} required minLength={3} maxLength={20} />
                        </Field>
                    )}
                    {mode === "dealer" && (
                        <Field label="Dealership name">
                            <Input value={form.tenant} onChange={set("tenant")} required minLength={3} maxLength={32} />
                        </Field>
                    )}
                    <Field label="Email">
                        <Input type="email" value={form.email} onChange={set("email")} required />
                    </Field>
                    <Field label="Password">
                        <Input
                            type="password"
                            value={form.password}
                            onChange={set("password")}
                            required
                            minLength={mode === "sign-in" ? 1 : 8}
                            maxLength={64}
                        />
                    </Field>
                    <Alert error={action.error} />
                    <Button className="w-full" disabled={action.pending}>
                        {titles[mode]}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
