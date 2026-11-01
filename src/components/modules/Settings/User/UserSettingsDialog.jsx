import React from "react"
import {UserSettings} from "./UserSettings"
import { ButtonBar,Button } from "../../../atoms"
import { Dialog } from "../../../molecules"



export const UserSettingsDialog = ({onOK})=> {

    return <Dialog id='UserSettings' title='User' width='60vw' height='60vh' onESC={onOK}>

        <UserSettings height={ 'calc(100% - 11vh)'} />
        <ButtonBar justify='flex-end'>
            <Button text='OK' primary={true} onClick={onOK}/>
        </ButtonBar>
    </Dialog>

}