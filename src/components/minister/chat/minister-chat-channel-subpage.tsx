import { useEffect, useState } from "react";
import { GetAdminRole, GetRole, Role } from "../../../structs/role";
import { User } from "../../../structs/user";
import ChatElement from "../../../generals/chat-element";
import { useAuth } from "../../../generals/permission/AuthContext";

export default function MinisterChatChannelSubpage({ getParams }: { getParams: ({ func, type, show }: { func: (p: string | User) => Promise<unknown>, type: string, show: boolean }) => Promise<unknown> }) {
    const [role, setRole] = useState<Role | null>()
    const { user } = useAuth();

    const [adminRole, setAdminRole] = useState<Role | null>()
    useEffect(() => {
        (async function () {
            setAdminRole(await GetAdminRole({ type: 'minister', user: user }))
            setRole(await GetRole({ type: "minister", user: user as User }))
        }());
    }, [getParams])

    return (
        <div className="minister-group-chat">
            <ChatElement getParams={getParams} name={'minister_channel'} viewer={adminRole ? (adminRole?.roleID + 'channel') : (role?.roleID + 'channel')} writer={adminRole ? adminRole.roleID + 'channel': ''} />
        </div>
    );
}