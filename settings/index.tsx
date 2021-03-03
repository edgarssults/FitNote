// base64 encoded loader image
const loader = "data:image/png;base64,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";

registerSettingsPage(({ settings, settingsStorage }) => {
  return (
    <Page>
      <Section title={<Text bold align="center">Account</Text>}>
        {isLoggedIn(settingsStorage)
          ? isLoggingIn(settingsStorage)
            ? <Loader message="Logging in..." />
            : <Text>Logged in as {settingExists(settingsStorage, 'displayName') && settingExists(settingsStorage, 'userPrincipalName') ? `${settingsStorage.getItem('displayName')} (${settingsStorage.getItem('userPrincipalName')})` : '..'}</Text>
          : <Oauth
              title="Microsoft Account Login"
              label="Microsoft Account"
              status="Login"
              authorizeUrl="https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
              requestTokenUrl="https://login.microsoftonline.com/consumers/oauth2/v2.0/token"
              clientId="98d88e94-97a8-42dc-a692-cdcb8f79a9f3"
              clientSecret=""
              scope="openid profile User.Read Notes.Read Notes.Read.All offline_access"
              description="Please log in with your Microsoft account to see your notes"
              onReturn={async (response) => initiateAccessTokenRetrieval(settingsStorage, response)}
              onAccessToken={async () => {
                console.warn('onAccessToken should not have been called');
              }}
            />
        }
      </Section>
      
      {isLoggedIn(settingsStorage) && !isLoggingIn(settingsStorage) &&
        <Section title={<Text bold align="center">Notes</Text>}>
          {areNotesLoading(settingsStorage)
              ? <Loader message="Loading notes..." />
              : areNotesLoaded(settingsStorage)
                ? <Select
                    label={`Select a note to sync`}
                    settingsKey="selectedNote"
                    selectViewTitle="Select Note"
                    options={getNotes(settingsStorage)}
                  />
                : <Text>No notes found or there was an error loading them</Text>
          }
          {!isNoteSyncing(settingsStorage) && isNoteSynced(settingsStorage) &&
            <Text>Synced {getDateString(settingsStorage, 'selectedNoteSynced')}</Text>
          }
          {!isNoteSyncing(settingsStorage) && hasSyncFailed(settingsStorage) &&
            <Text>Error: {settingsStorage.getItem('syncError')}</Text>
          }
          {isNoteSyncing(settingsStorage)
            ? <Loader message="Syncing note..." />
            : isNoteSelected(settingsStorage) &&
              <Button
                list
                label="Sync Again"
                onClick={() => initiateNoteSync(settingsStorage)}
              />
          }
          {!areNotesLoading(settingsStorage) &&
            <Button
              list
              label="Refresh Notes"
              onClick={() => initiateNoteRefresh(settingsStorage)}
            />
          }
        </Section>
      }

      {settingExists(settingsStorage, 'errors') &&
        <Section title={<Text bold align="center">Errors</Text>}>
          {getErrors(settingsStorage).map(error => <Text>{error}</Text>)}
          <Button
            list
            label="Clear errors"
            onClick={() => clearErrors(settingsStorage)}
          />
        </Section>
      }
        
      <Section title={<Text bold align="center">Reset</Text>}>
        <Button
          list
          label="Reset Settings"
          onClick={() => clearSettingsStorage(settingsStorage)}
        />
      </Section>
    </Page>
  );
});

/**
 * Determines whether a settings exists in the settings storage.
 * @param settingsStorage Settings storage instance.
 * @param settingName Setting name.
 */
function settingExists(settingsStorage: LiveStorage, settingName: string): boolean {
  let setting = settingsStorage.getItem(settingName);
  
  if (!setting) {
    return false;
  }
  
  return setting.length > 0;
}

/**
 * Gets a list of notes from settings.
 * @param settingsStorage Settings storage instance.
 */
function getNotes(settingsStorage: LiveStorage): Array<any> {
  let notes = settingsStorage.getItem('notes');
  return notes ? JSON.parse(notes) : [];
}

/**
 * Get a formatted date string from a date setting.
 * @param settingsStorage Settings storage instance.
 * @param settingName Setting name.
 */
function getDateString(settingsStorage: LiveStorage, settingName: string): string {
  let dateSetting = settingsStorage.getItem(settingName);
  if (!dateSetting) {
    return '???';
  }

  return new Date(Number.parseInt(dateSetting)).toLocaleString();
}

/**
 * Resets everything.
 * @param settingsStorage Settings storage instance.
 */
function clearSettingsStorage(settingsStorage: LiveStorage): void {
  settingsStorage.setItem('clearSyncedNote', 'true');
  settingsStorage.clear();
}

/**
 * Initiates selected note syncing to the device.
 * @param settingsStorage Settings storage instance.
 */
function initiateNoteSync(settingsStorage: LiveStorage): void {
  settingsStorage.setItem('syncSelectedNote', 'true');
}

/**
 * Initiates note list refresh.
 * @param settingsStorage Settings storage instance.
 */
function initiateNoteRefresh(settingsStorage: LiveStorage): void {
  settingsStorage.setItem('refreshNotes', 'true');
}

/**
 * Initiates access token retrieval.
 * @param settingsStorage Settings storage instance.
 * @param response OAuth button response.
 */
function initiateAccessTokenRetrieval(settingsStorage: LiveStorage, response: any): void {
  settingsStorage.setItem('oauth-response', JSON.stringify(response));
}

/**
 * Clears logged errors.
 * @param settingsStorage Settings storage instance.
 */
function clearErrors(settingsStorage: LiveStorage): void {
  settingsStorage.removeItem('errors');
}

/**
 * errors
 * @param settingsStorage Settings storage instance.
 */
function getErrors(settingsStorage: LiveStorage): string[] {
  let errors = settingsStorage.getItem('errors');
  return errors ? JSON.parse(errors) : [];
}

function isLoggingIn(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'oauth-loading');
}

function isLoggedIn(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'oauth');
}

function areNotesLoading(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'notes-loading');
}

function areNotesLoaded(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'notes');
}

function isNoteSyncing(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'sync-loading');
}

function isNoteSynced(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'selectedNoteSynced');
}

function hasSyncFailed(settingsStorage: LiveStorage): boolean {
  return settingExists(settingsStorage, 'syncError');
}

function isNoteSelected(settingsStorage: LiveStorage) : boolean {
  return settingExists(settingsStorage, 'selectedNote');
}

function Loader(props) {
  return (
    <TextImageRow icon={loader} label={props.message} />
  );
}
