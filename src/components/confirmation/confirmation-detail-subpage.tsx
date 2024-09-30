import { useEffect, useState } from "react";
import { Alias, GetAdminRole, GetAliases, GetRole, Role } from "../../structs/role";
import { User } from "../../structs/user";
import { FetchOwnerGet } from "../../features/FetchOwnerGet";
import { FetchTokenGet } from "../../features/FetchTokenGet";
import EditableElement from "../../generals/editable-element";

export default function ConfirmationDetailSubpage({ getParams }: { getParams: ({ func, type, show }: { func: (p: string | User) => Promise<unknown>, type: string, show: boolean }) => Promise<unknown> }) {
    const [role, setRole] = useState<Role | null>()

    const [adminRole, setAdminRole] = useState<Role | null>()
    const [aliases, setAliases] = useState<Alias[]>([])
    useEffect(() => {
        (async function () {
            getParams({
                func: async (param: string | User) => {
                    const user = param as User
                    setAdminRole(await GetAdminRole({ getParams: getParams, type: 'confirmation', user: user }))
                }, type: 'user', show: false
            });
        }());
    }, [getParams])

    useEffect(() => {
        (async function () {
            setAliases((await GetAliases({ getParams: getParams, adminID: adminRole?.roleID ?? '' })).sort((a, b) => a.alias?.localeCompare(b.alias ?? '') ?? 0))
        }());
    }, [getParams, adminRole])
    useEffect(() => {
        (async function () {
            await getParams({
                func: async (user: unknown) => {
                    setRole(await GetRole({ getParams: getParams, type: "confirmation", user: user as User }))
                }, type: 'user', show: true
            })
        })();
    }, [getParams])

    useEffect(() => {
        if (role != null)
            (async function () {
                await getParams({
                    func: async (param: string | User) => {
                        const token = param as string
                        if ((await FetchOwnerGet(token, role.roleID) == null) || !role.isRegistered)
                            await FetchTokenGet(token)
                    }, type: 'token', show: true
                })
            })();
    }, [getParams, role])
    const selectAlias = (alias: Alias) => {
        if (adminRole != null)
            setRole({ roleID: alias.id, ownerID: alias.ownerID, user: adminRole.user, type: 'alias', isRegistered: true, alias: alias.alias })
    }
    return (
        <div className="confirmation-detail">
            {aliases && adminRole ? <select defaultValue={undefined} onChange={(e) => { selectAlias(aliases[e.currentTarget.selectedIndex]) }}>
                {aliases.map((alias) => (<option>
                    {alias.alias}            </option>))}
            </select> : null}
            {
                role?.isRegistered ?
                    <>
                        <h4><EditableElement getParams={getParams} editable={
                            {
                                name: role.roleID + 'alias',
                                type: 'text',
                                multiple: false,
                                description: 'Alias',
                                dbkey: adminRole?.roleID,
                                showdescription: false,
                                showchildren: false,
                            }} />
                        </h4>
                        <div><EditableElement getParams={getParams} editable={
                            {
                                name: role.roleID + 'level',
                                type: 'radio',
                                multiple: false,
                                description: 'Rok formacyjny',
                                dbkey: adminRole?.roleID,
                                showdescription: true,
                                showchildren: false,
                                options: [
                                    { label: '1. rok formacyjny', value: '0' },
                                    { label: '2. rok formacyjny', value: '1' },
                                    { label: '3. rok formacyjny', value: '2' },
                                ],
                            }} />
                        </div>
                        <div>
                            <EditableElement getParams={getParams} editable={
                                {
                                    name: role?.roleID + 'address',
                                    type: 'text',
                                    multiple: false,
                                    description: 'Adres zamieszkania',
                                    dbkey: role?.roleID,
                                    showdescription: true,
                                    showchildren: false,
                                }} />
                        </div>
                        <div>
                            <EditableElement getParams={getParams} editable={
                                {
                                    name: role?.roleID + 'telefon',
                                    type: 'tel',
                                    multiple: true,
                                    description: 'Telefon',
                                    dbkey: role?.roleID,
                                    showdescription: true,
                                    showchildren: false,
                                }} />
                        </div>
                        <div>
                            <EditableElement getParams={getParams} editable={
                                {
                                    name: role?.roleID + 'aims',
                                    type: 'string',
                                    multiple: true,
                                    description: 'Cele na rok formacyjny',
                                    dbkey: role?.roleID,
                                    showdescription: true,
                                    showchildren: false,
                                }} />
                        </div>
                    </> :
                    <>
                        <h3>Zgłoszenie czeka na zatwierdzenie</h3>
                    </>
            }
        </div>
    );
}