import { useEffect, useState } from "react";
import { GetRole, Role } from "../../structs/role";
import { User } from "../../structs/user";
import { FetchInformationGetAll, StringOutput } from "../../features/FetchInformationGet";
import { FetchTokenGet } from "../../features/FetchTokenGet";
import OldEditableElement from "../../temp/old-editable-element";
import { FetchOwnerPut } from "../../features/FetchOwnerPut";
import { FetchOwnerPost } from "../../features/FetchOwnerPost";

export default function ConfirmationAdminSubpage({ getParams }: { getParams: ({ func, type, show }: { func: (t: unknown) => Promise<unknown>, type: string, show: boolean }) => Promise<unknown> }) {

    const [role, setRole] = useState<Role | null>()
    const [attendees, setAttendees] = useState<StringOutput[]>()
    useEffect(() => {
        (async function () {
            getParams({
                func: async (param0: unknown) => {
                    const token = param0 as string
                    const tempAttendees = (await FetchInformationGetAll('string', token, 'confirmation_attendee')) as unknown as StringOutput[]
                    setAttendees(tempAttendees)
                    for (let i = 0; i < tempAttendees.length; i++) {
                        const tempOwnerID = (await FetchInformationGetAll('string', token, tempAttendees[i].output + 'owner')) as unknown as StringOutput[]
                        if (tempOwnerID.length > 0) {
                            console.log(tempOwnerID[0].output)
                            tempAttendees[i].id = tempOwnerID[0].output
                        }
                        else {
                            tempAttendees[i].id = ''
                        }
                    }
                    getParams({
                        func: async (param1: unknown) => {
                            const user = param1 as User
                            setRole(await GetRole({ getParams: getParams, type: 'confirmation_admin', user: user }))
                        }, type: 'user', show: false
                    });
                }, type: 'token', show: false
            });
        }());
    }, [getParams])

    const reload = async () => {
        getParams({
            func: async (param: unknown) => {
                    FetchTokenGet(param as string)
            }, type: 'token', show: false
        });
    }

    const acceptAttendee = async (output: StringOutput) =>
    {
        getParams({
            func: async (param: unknown) => {
                const token = param as string
                await FetchOwnerPut(token, 'confirmation_group_viewer', role?.roleID ?? '', output.id, false, false, false)
                await FetchOwnerPost(token, output.output + 'channel', role?.roleID ?? '')
                await FetchOwnerPut(token, 'confirmation_channel_viewer', output.output + 'channel', output.id, false, false, false)
            }, type: 'token', show: false
        });
    }

    return (
        <>
            {role?.roleID + ' -|- ' + role?.ownerID + ' -|- ' + role?.type + ' -|- ' + role?.user}
            <input type="button" value="Reload" onClick={reload} />
            {attendees?.map(attendee => (
                <div>
                    <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'name'} dbkey={''} type="text" multiple={false} showdescription={false} />
                    <OldEditableElement getParams={getParams} name={attendee.output + 'surname'} dbkey={''} type="text" multiple={false} showdescription={false} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'level'} dbkey={attendee.output + 'channel'} description='Formacja' type="text" multiple={true} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'baptism'} dbkey={attendee.output + 'channel'} description='Chrzest' type="text" multiple={false} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'permission'} dbkey={attendee.output + 'channel'} description='Zgoda' type="text" multiple={false} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'birthday'} dbkey={''} description='Data urodzenia' type="text" multiple={false} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'address'} dbkey={''} description='Adres zamieszkania' type="text" multiple={false} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'confirmationname'} dbkey={''} description='Patron bierzmowanie (tzw. 3. imię)' type="text" multiple={false} showdescription={true} />
                                </div>
                                <div>
                    <OldEditableElement getParams={getParams} name={attendee.output + 'sponsor'} dbkey={''} description='Świadek bierzmowania' type="text" multiple={false} showdescription={true} />
                                </div>
                        {attendee.id != '' ?
                        <input type='button' value='+' onClick={() => acceptAttendee(attendee)} />
                        : null
                        }
                </div>
            ))}
        </>
    );
}