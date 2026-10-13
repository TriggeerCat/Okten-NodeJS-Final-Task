import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth";
import { isStaff } from "../constants";
import { Badge, Button } from "./ui";

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2 py-1 text-sm ${isActive ? "bg-blue-50 font-medium text-blue-700" : "text-slate-600 hover:text-slate-900"}`;

export function Layout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
                    <NavLink to="/" className="mr-4 text-lg font-bold text-blue-600">
                        AutoRia Clone
                    </NavLink>
                    <NavLink to="/" end className={linkClass}>
                        Cars
                    </NavLink>
                    {user && (
                        <>
                            <NavLink to="/notices/new" className={linkClass}>
                                Sell a car
                            </NavLink>
                            <NavLink to="/my" className={linkClass}>
                                My notices
                            </NavLink>
                        </>
                    )}
                    {isStaff(user) && (
                        <>
                            <NavLink to="/moderation" className={linkClass}>
                                Moderation
                            </NavLink>
                            <NavLink to="/users" className={linkClass}>
                                Users
                            </NavLink>
                        </>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        {user ? (
                            <>
                                <NavLink to="/profile" className={linkClass}>
                                    {user.name}
                                </NavLink>
                                <Badge>{user.role}</Badge>
                                {user.isPremium ? (
                                    <Badge>premium</Badge>
                                ) : (
                                    <NavLink to="/premium" className="rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200">
                                        Get premium
                                    </NavLink>
                                )}
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        await signOut();
                                        navigate("/");
                                    }}
                                >
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <NavLink to="/auth" className={linkClass}>
                                Sign in
                            </NavLink>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
