import { settingsStorage } from "settings";

/**
 * Logs an error message.
 * @param message Message to log.
 */
export function logError(message: string) {
    let errors: string[] = [];

    let errorSetting = settingsStorage.getItem('errors');
    if (errorSetting) {
        errors = JSON.parse(errorSetting);
    }

    if (errors.length >= 5) {
        errors.pop();
    }

    errors.unshift(message);
    settingsStorage.setItem('errors', JSON.stringify(errors));
    console.error(message);
}