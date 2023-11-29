import supabase from "./supabase";

export function ValidateRegistration(vorname, nachname, email, passwort, confirmPasswort, code) {
    const errorList = [];
    if (vorname.length == 0) {
        errorList.push("Vorname darf nicht leer sein.");
    }
    if (nachname.length == 0) {
        errorList.push("Nachname darf nicht leer sein.");
    }
    if (email.length == 0) {
        errorList.push("Email darf nicht leer sein.");
    }
    if (passwort.length == 0) {
        errorList.push("Passwort darf nicht leer sein.");
    }
    if (passwort.length < 6) {
        errorList.push("Passwort muss mindestens 6 Zeichen lang sein.");
    }
    if (passwort != confirmPasswort) {
        errorList.push("Passwörter stimmen nicht überein.");
    }
    if (code.length == 0) {
        errorList.push("Code darf nicht leer sein.");
    }
    if (code.length != 6) {
        errorList.push("Code muss 6 Zeichen lang sein.");
    }
    if (errorList.length == 0) {
        return true;
    }
    return errorList;
}

export async function CheckCode(code) {
    console.log(code)
    const { data, error } = await supabase.from("code").select("*").eq("code", parseInt(code)).single();
    if (error) {
        console.log(error);
        return false;
    }
    if (data.length == 0) {
        return false;
    }
    const codeDict = CodeForBadge(data.id_code);
    return codeDict;
}

function CodeForBadge(id) {
    console.log(id)
    const codeDict = {
        1: [
            1 // Badge ICT-Campus
        ],
        2: [
            6 // Badge Extern
        ],
        3: [
            1, // Badge ICT-Campus
            5 // Badge Team 404
        ],
        4: [
            1, // Badge ICT-Campus
            4 // Badge Team DANAMIKE
        ],
    }
    console.log(codeDict[id])
    return codeDict[id];
}