import { useState } from "react";
import { useNavigate } from "react-router";
import { api, tokenStorage, useAction } from "../api";
import { useAuth } from "../auth";
import type { User } from "../types";
import { formatDate } from "../constants";
import { Alert, Badge, Button, Card, Field, Input } from "../components/ui";

export function ProfilePage() {
    const { user, reload } = useAuth();
    const navigate = useNavigate();
    const save = useAction();
    const account = useAction();
    const join = useAction();
    const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
    const [dealership, setDealership] = useState("");

    if (!user) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card title="Account">
                <div className="mb-4 flex flex-wrap gap-1">
                    <Badge>{user.role}</Badge>
                    <Badge>{user.isPremium ? "premium" : "basic"} account</Badge>
                    {user.tenant && <Badge>dealership: {user.tenant}</Badge>}
                </div>
                <p className="mb-4 text-sm text-slate-500">Member since {formatDate(user.createdAt)}</p>
                <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const ok = await save.run(
                            () => api<User>(`/users/${user._id}`, { method: "PUT", body: form }).then(reload),
                            "Saved"
                        );
                        return ok;
                    }}
                >
                    <Field label="Name">
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={3} maxLength={20} />
                    </Field>
                    <Field label="Email">
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </Field>
                    <Alert error={save.error} success={save.success} />
                    <Button disabled={save.pending}>Save</Button>
                </form>
            </Card>

            <div className="space-y-4">
                {!user.isPremium && (
                    <Card title="Premium">
                        <p className="mb-3 text-sm text-slate-600">
                            Premium accounts can post unlimited cars and see views and average market prices for their
                            notices.
                        </p>
                        <Button onClick={() => navigate("/premium")}>Get premium</Button>
                    </Card>
                )}

                {!user.tenant && (
                    <Card title="Join a dealership">
                        {user.tenantRequest ? (
                            <p className="text-sm">
                                You asked to join <b>{user.tenantRequest}</b>. Waiting for the dealership to accept.
                            </p>
                        ) : (
                            <form
                                className="space-y-3"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    await join.run(
                                        () =>
                                            api("/users/tenant/request", { method: "POST", body: { tenant: dealership } }).then(reload),
                                        "Request sent"
                                    );
                                }}
                            >
                                <Field label="Dealership name">
                                    <Input value={dealership} onChange={(e) => setDealership(e.target.value)} required minLength={3} />
                                </Field>
                                <Alert error={join.error} success={join.success} />
                                <Button disabled={join.pending}>Send request</Button>
                            </form>
                        )}
                    </Card>
                )}

                <Card title="Security">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            disabled={account.pending}
                            onClick={() =>
                                account.run(async () => {
                                    await api("/auth/sign-out-all", { method: "POST" });
                                    tokenStorage.set(null);
                                    await reload();
                                    navigate("/auth");
                                })
                            }
                        >
                            Sign out everywhere
                        </Button>
                        <Button
                            variant="danger"
                            disabled={account.pending}
                            onClick={() =>
                                confirm("Delete your account and all your notices?") &&
                                account.run(async () => {
                                    await api(`/users/${user._id}`, { method: "DELETE" });
                                    tokenStorage.set(null);
                                    await reload();
                                    navigate("/");
                                })
                            }
                        >
                            Delete account
                        </Button>
                    </div>
                    <div className="mt-2">
                        <Alert error={account.error} />
                    </div>
                </Card>
            </div>
        </div>
    );
}
