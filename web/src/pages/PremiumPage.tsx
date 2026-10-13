import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, useAction } from "../api";
import { useAuth } from "../auth";
import { PREMIUM_PRICE, formatPrice } from "../constants";
import { Alert, Button, Card, Field, Input } from "../components/ui";

const PERKS = [
    "Unlimited number of notices",
    "Views of your notices per day, week and month",
    "Average price of your car in your region and across Ukraine"
];

// groups digits as 4242 4242 4242 4242
const formatCardNumber = (value: string) =>
    value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export function PremiumPage() {
    const { user, reload } = useAuth();
    const navigate = useNavigate();
    const payment = useAction();
    const [form, setForm] = useState({ cardHolder: "", cardNumber: "", expiry: "", cvv: "" });

    if (!user) return null;
    if (user.isPremium)
        return (
            <Card title="You have premium">
                <p className="text-sm">
                    Enjoy unlimited notices and statistics.{" "}
                    <Link to="/my" className="text-blue-700 hover:underline">
                        Go to your notices
                    </Link>
                </p>
            </Card>
        );

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card title="Premium account">
                <p className="mb-3 text-3xl font-bold">{formatPrice(PREMIUM_PRICE, "uah")}</p>
                <ul className="space-y-2 text-sm">
                    {PERKS.map((perk) => (
                        <li key={perk}>✓ {perk}</li>
                    ))}
                </ul>
            </Card>

            <Card title="Payment">
                <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const ok = await payment.run(async () => {
                            await api("/users/premium/purchase", { method: "POST", body: form });
                            await reload();
                            return true;
                        });
                        if (ok) navigate("/profile");
                    }}
                >
                    <Field label="Card holder">
                        <Input
                            required
                            autoComplete="cc-name"
                            value={form.cardHolder}
                            onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
                            placeholder="TARAS SHEVCHENKO"
                        />
                    </Field>
                    <Field label="Card number">
                        <Input
                            required
                            inputMode="numeric"
                            autoComplete="cc-number"
                            value={form.cardNumber}
                            onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                            placeholder="4242 4242 4242 4242"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Expiry">
                            <Input
                                required
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                value={form.expiry}
                                onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                                placeholder="MM/YY"
                            />
                        </Field>
                        <Field label="CVV">
                            <Input
                                required
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                maxLength={3}
                                value={form.cvv}
                                onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })}
                                placeholder="123"
                            />
                        </Field>
                    </div>
                    <Alert error={payment.error} />
                    <Button className="w-full" disabled={payment.pending}>
                        {payment.pending ? "Processing..." : `Pay ${formatPrice(PREMIUM_PRICE, "uah")}`}
                    </Button>
                    <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Demo payment, no money is charged and card data is not stored. Use 4242 4242 4242 4242 with any
                        future date and any CVV. 4000 0000 0000 0002 is always declined.
                    </p>
                </form>
            </Card>
        </div>
    );
}
