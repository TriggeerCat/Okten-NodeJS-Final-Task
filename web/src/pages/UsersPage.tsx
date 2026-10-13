import { useState } from "react";
import { api, toQuery, useAction, useApi } from "../api";
import { useAuth } from "../auth";
import type { Paginated, User } from "../types";
import { isAdmin, isPlatformAdmin, isStaff } from "../constants";
import { Alert, Badge, Button, Loading, Pagination } from "../components/ui";

export function UsersPage() {
    const { user: me } = useAuth();
    const [page, setPage] = useState(1);
    const action = useAction();
    const { data, error, loading, reload } = useApi<Paginated<User>>(`/users${toQuery({ page, limit: 20 })}`);

    const act = (path: string, method: "PATCH" | "DELETE", message: string) =>
        action.run(() => api(path, { method }), message).then(reload);

    if (!me) return null;

    return (
        <>
            <h1 className="text-2xl font-bold">Users</h1>
            {me.tenant && <p className="text-sm text-slate-500">Members of and applicants to {me.tenant}</p>}
            <Alert error={error ?? action.error} success={action.success} />
            {loading && !data ? (
                <Loading />
            ) : (
                data && (
                    <>
                        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Dealership</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((user) => {
                                        const isSelf = user._id === me._id;
                                        const isUserAdmin = user.role === "administrator";
                                        const inMyScope = !me.tenant || user.tenant === me.tenant;
                                        const id = user._id;
                                        return (
                                            <tr key={id} className="border-b border-slate-100 last:border-0">
                                                <td className="p-3">
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-slate-500">{user.email}</p>
                                                </td>
                                                <td className="space-x-1 p-3">
                                                    <Badge>{user.role}</Badge>
                                                    {user.isPremium && <Badge>premium</Badge>}
                                                    {user.isBanned && <Badge>banned</Badge>}
                                                </td>
                                                <td className="p-3">
                                                    {user.tenant ?? "—"}
                                                    {user.tenantRequest && (
                                                        <p className="text-xs text-amber-700">
                                                            wants to join {user.tenantRequest}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {me.tenant && !user.tenant && user.tenantRequest === me.tenant && (
                                                            <Button onClick={() => act(`/users/${id}/tenant/make`, "PATCH", "User joined the dealership")}>
                                                                Accept
                                                            </Button>
                                                        )}
                                                        {!isSelf && !isUserAdmin && inMyScope && isStaff(me) && (
                                                            <Button
                                                                variant={user.isBanned ? "secondary" : "danger"}
                                                                onClick={() =>
                                                                    act(
                                                                        `/users/${id}/${user.isBanned ? "unban" : "ban"}`,
                                                                        "PATCH",
                                                                        user.isBanned ? "User unbanned" : "User banned"
                                                                    )
                                                                }
                                                            >
                                                                {user.isBanned ? "Unban" : "Ban"}
                                                            </Button>
                                                        )}
                                                        {!isSelf && inMyScope && isAdmin(me) && (user.role === "buyer" || user.role === "seller") && (
                                                            <Button variant="secondary" onClick={() => act(`/users/${id}/promote/manager`, "PATCH", "User is a manager now")}>
                                                                Make manager
                                                            </Button>
                                                        )}
                                                        {!isSelf && inMyScope && isAdmin(me) && (user.role === "manager" || user.role === "seller") && (
                                                            <Button variant="secondary" onClick={() => act(`/users/${id}/demote`, "PATCH", "User is a buyer now")}>
                                                                Demote
                                                            </Button>
                                                        )}
                                                        {isPlatformAdmin(me) && !user.isPremium && (
                                                            <Button variant="secondary" onClick={() => act(`/users/${id}/give-premium`, "PATCH", "Premium granted")}>
                                                                Give premium
                                                            </Button>
                                                        )}
                                                        {!isSelf && !isUserAdmin && user.tenant && inMyScope && isStaff(me) && (
                                                            <Button variant="secondary" onClick={() => act(`/users/${id}/tenant/remove`, "PATCH", "Removed from the dealership")}>
                                                                Remove from dealership
                                                            </Button>
                                                        )}
                                                        {!isSelf && !isUserAdmin && inMyScope && isAdmin(me) && (
                                                            <Button
                                                                variant="danger"
                                                                onClick={() => confirm(`Delete ${user.name}?`) && act(`/users/${id}`, "DELETE", "User deleted")}
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
                    </>
                )
            )}
        </>
    );
}
