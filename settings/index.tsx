registerSettingsPage(({ settings, settingsStorage }) => {
  return (
    <Page>
      <Section title={<Text bold align="center">Account</Text>}>
        {settingExists(settingsStorage, 'oauth')
          ? <Text>Logged in as {settingsStorage.getItem('displayName')} ({settingsStorage.getItem('userPrincipalName')})</Text>
          : <Oauth
              title="Microsoft Account Login"
              label="Microsoft Account"
              status="Login"
              authorizeUrl="https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
              requestTokenUrl="https://login.microsoftonline.com/consumers/oauth2/v2.0/token"
              clientId="98d88e94-97a8-42dc-a692-cdcb8f79a9f3"
              clientSecret=""
              scope="openid profile User.Read Notes.Read"
              description="Please log in with your Microsoft account to see your notes"
              onReturn={async (response) => {
                settingsStorage.setItem('oauth-response', JSON.stringify(response));
              }}
            />
        }
        {settingExists(settingsStorage, 'oauthExpires') &&
          <Text>Expires {getDateString(settingsStorage, 'oauthExpires')}</Text>
        }
        {settingExists(settingsStorage, 'oauthExpires') && !isAccessTokenValid(settingsStorage) &&
          <Button
            list
            label="Refresh Access"
            onClick={() => refresh(settingsStorage)}
          />
        }
      </Section>
      
      {isAccessTokenValid(settingsStorage) && settingExists(settingsStorage, 'notes') &&
        <Section title={<Text bold align="center">Notes</Text>}>
          <Select
            label={`Select a note to sync`}
            settingsKey="selectedNote"
            selectViewTitle="Select Note"
            options={getNotes(settingsStorage)}
          />
          {settingExists(settingsStorage, 'selectedNoteSynced') &&
            <Text>Synced {getDateString(settingsStorage, 'selectedNoteSynced')}</Text>
          }
          {settingExists(settingsStorage, 'syncError') &&
            <Text>Error: {settingsStorage.getItem('syncError')}</Text>
          }
          {settingExists(settingsStorage, 'selectedNote') &&
            <Button
              list
              label="Sync Now"
              onClick={() => syncNoteNow(settingsStorage)}
            />
          }
        </Section>
      }
      
      <Section title={<Text bold align="center">Reset</Text>}>
        <Button
          list
          label="Reset Everything"
          onClick={() => reset(settingsStorage)}
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
    return '[never]';
  }

  return new Date(Number.parseInt(dateSetting)).toLocaleString();
}

/**
 * Resets everything (except whatever's synced to the watch).
 * @param settingsStorage Settings storage instance.
 */
function reset(settingsStorage: LiveStorage): void {
  settingsStorage.clear();
}

/**
 * Initiates selected note syncing.
 * @param settingsStorage Settings storage instance.
 */
function syncNoteNow(settingsStorage: LiveStorage): void {
  settingsStorage.setItem('syncSelectedNote', 'true');
}

/**
 * Initiates access token refresh.
 * @param settingsStorage Settings storage instance.
 */
function refresh(settingsStorage: LiveStorage): void {
  settingsStorage.setItem('refreshAccessToken', 'true');
}

/**
 * Determines whether the access token is valid.
 * @param settingsStorage Settings storage instance.
 */
function isAccessTokenValid(settingsStorage: LiveStorage): boolean {
  let expirySetting = settingsStorage.getItem('oauthExpires');
  if (!expirySetting) {
    return false;
  }

  let expiry = parseInt(expirySetting);
  if (expiry <= Date.now()) {
    return false;
  }

  return true;
}
