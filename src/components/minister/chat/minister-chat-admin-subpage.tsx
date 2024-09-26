import { useEffect, useState } from "react";
import { Alias, GetAdminRole, GetAliases, GetRole, Role } from "../../../structs/role";
import { User } from "../../../structs/user";
import ChatElement from "../../../generals/chat-element";
import { FetchInformationGetAll, StringOutput } from "../../../features/FetchInformationGet";

export default function MinisterChatAdminSubpage({ getParams }: { getParams: ({ func, type, show }: { func: (p: string| User) => Promise<unknown>, type: string, show: boolean }) => Promise<unknown> }) {
    const [role, setRole] = useState<Role | null>()

    const [adminRole, setAdminRole] = useState<Role | null>()
    const [aliases, setAliases] = useState<Alias[]>([])
    const [alias, setAlias] = useState('')
    useEffect(() => {
        (async function () {
            getParams({
                func: async (param: string | User) => {
                    const user = param as User
                    setAdminRole(await GetAdminRole({ getParams: getParams, type: 'minister', user: user }))
                    setRole(await GetRole({ getParams: getParams, type: "minister", user: user as User }))
                }, type: 'user', show: false
            });
        }());
    }, [getParams])

    useEffect(() => {
        (async function () {
            setAliases((await GetAliases({ getParams: getParams, adminID: adminRole?.roleID ?? '' })).sort((a, b) => a.alias?.localeCompare(b.alias ?? '') ?? 0))
        }());
    }, [getParams, adminRole])
    const selectAlias = (alias: Alias) => {
        if (adminRole != null)
            setRole({ roleID: alias.id, ownerID: alias.ownerID, user: adminRole.user, type: 'alias', isRegistered: true, alias: alias.alias })
    }
    useEffect(() => {
        if (!adminRole && role)
            (async function () {
                getParams({
                    func: async (token: string | User) => {
                        setAlias((await FetchInformationGetAll('string', token as string, role ? (role.roleID + 'alias') : '') as StringOutput[])[0]?.id)
                    }, type: 'token', show: false
                });
            }());
    }, [getParams, adminRole, role])

    return (
        <div className="minister-group-chat">
            {aliases ? <select defaultValue={undefined} onChange={(e) => { selectAlias(aliases[e.currentTarget.selectedIndex]) }}>
                {aliases.map((alias) => (<option>
                    {alias.alias}            </option>))}
            </select> : null}
            <ChatElement getParams={getParams} name={'minister_' + role?.roleID} viewer={role?.roleID + 'common'} writer={adminRole ? (adminRole.roleID) : (role?.roleID)} alias={alias} />
        </div>
    );
}