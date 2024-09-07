import { useEffect, useState } from "react";
import OldEditableElement from "../../temp/old-editable-element";
import { CreateRole, GetRole, Role } from "../../structs/role";
import { User } from "../../structs/user";
import { FetchOwnerPut } from "../../features/FetchOwnerPut";
import { FetchInformationPost } from "../../features/FetchInformationPost";
import { FetchInformationGetAll, StringOutput } from "../../features/FetchInformationGet";
import { FetchInformationDelete } from "../../features/FetchInformationDelete";

export default function MinisterRegisterSubpage({ getParams }: { getParams: ({ func, type, show }: { func: (t: unknown) => Promise<unknown>, type: string, show: boolean }) => Promise<unknown> }) {

    const [selectedUser, setSelectedUser] = useState<User>()
    const [role, setRole] = useState<Role | null>()
    useEffect(() => {
        (async function () {
            await getParams({
                func: async (param: unknown) => {
                     setSelectedUser(param as User)
                }, type: 'user', show: true
            })
        })();
    }, [getParams])

    const selectUser = async () => {
        await getParams({ func: async (param: unknown) => setSelectedUser(param as User), type: 'user', show: true })
    }
    useEffect(() => {
        (async function () {
            if (selectedUser != null) {
                setRole(await GetRole({ getParams: getParams, type: "confirmation", user: selectedUser }))
            }
        }());
    }, [getParams, selectedUser])

    const register = () => {
        (async function () {
            if (selectedUser != null) {
                const newRole = await CreateRole({ getParams: getParams, type: "confirmation", user: selectedUser, admin: 'a9920c2d-fca7-45a1-9742-2d8c0fe4c65a' }) as unknown as Role
                setRole(newRole)
                await getParams({
                    func: async (param: unknown) => {
                        const token = param as string
                        await FetchOwnerPut(token, 'confirmation_viewer', newRole.roleID, 'a9920c2d-fca7-45a1-9742-2d8c0fe4c65a', false, false, false)
                        await FetchInformationPost(token, newRole.roleID, ['confirmation_attendee'], newRole.roleID, [1])
                        const name = ((await FetchInformationGetAll('string', token, selectedUser.user + 'name')) as unknown as StringOutput[])[0].output
                        const surname = ((await FetchInformationGetAll('string', token, selectedUser.user + 'surname')) as unknown as StringOutput[])[0].output
                        await FetchInformationPost(token, newRole.roleID, [newRole.roleID + 'name'], name, [1])
                        await FetchInformationPost(token, newRole.roleID, [newRole.roleID + 'surname'], surname, [1])
                    }, type: 'token', show: true
                })
            }
        })();
    }

    const removeAttendee = async () => {
        getParams({
            func: async (param: unknown) => {
                const token = param as string
                const temp = (await FetchInformationGetAll('string', token, 'confirmation_attendee')) as unknown as StringOutput[]
                for (let i = 0; i < temp.length; i++) {
                    if (temp[i].output == role?.roleID)
                        FetchInformationDelete(token, role.roleID, temp[i].id)
                }
            }, type: 'token', show: false
        });
    }

    return (
        <>
            {selectedUser != null ?
                role != null ?
                    <>
                        <div onDoubleClick={removeAttendee}>Następująca osoba jest zgłoszona:</div>
                        <OldEditableElement getParams={getParams} name={selectedUser.user + "name"} dbkey={selectedUser.id + ''} type="text" multiple={false} showdescription={false} />
                        <OldEditableElement getParams={getParams} name={selectedUser.user + "surname"} dbkey={selectedUser.id + ''} type="text" multiple={false} showdescription={false} />
                    </>
                    :
                    <>
                        <div>Czy chcesz zgłosić następującą osobę do bierzmowania?</div>
                        <OldEditableElement getParams={getParams} name={selectedUser.user + "name"} dbkey={selectedUser.id + ''} type="text" multiple={false} showdescription={false} />
                        <OldEditableElement getParams={getParams} name={selectedUser.user + "surname"} dbkey={selectedUser.id + ''} type="text" multiple={false} showdescription={false} />
                        <input type="button" className="button" value="Zgłoś użytkownika" onClick={register} />
                    </>
                :
                <>
                    <h3>Musisz założyć i wybrać użytkownika, aby móc go zgłosić do bierzmowania.
                    </h3>
                    <input type="button" className="button" value="Wybierz użytkownika" onClick={selectUser} />
                </>
            }
        </>
    );
}