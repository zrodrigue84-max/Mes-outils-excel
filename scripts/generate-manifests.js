/**
 * Génère manifest.xml (prod) et manifest.dev.xml (localhost) depuis ribbon-manifest-data.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  RIBBON_BASE,
  OPEN_BUTTON,
  RIBBON_GROUPS,
  taskpaneUrl,
} from './ribbon-manifest-data.js';
import { RIBBON_ICONS, iconFileName } from './ribbon-icons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function urlResId(prefix) {
  return `Url.${prefix}`;
}

function labelResId(prefix) {
  return `Lbl.${prefix}`;
}

function descResId(prefix) {
  return `Desc.${prefix}`;
}

function xmlEscape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function iconResId(iconKey, size) {
  return `Icon.${iconKey}.${size}`;
}

function iconXml(iconKey) {
  return `
                  <Icon>
                    <bt:Image size="16" resid="${iconResId(iconKey, 16)}"/>
                    <bt:Image size="32" resid="${iconResId(iconKey, 32)}"/>
                    <bt:Image size="80" resid="${iconResId(iconKey, 80)}"/>
                  </Icon>`;
}

function buildManifest(baseUrl) {
  const urls = {};
  const shortStrings = {};
  const longStrings = {};
  const imageUrls = {};

  const registerImage = (iconKey, size) => {
    imageUrls[iconResId(iconKey, size)] = `${baseUrl}/assets/${iconFileName(iconKey, size)}`;
  };

  for (const iconKey of Object.keys(RIBBON_ICONS)) {
    for (const size of [16, 32, 80]) {
      registerImage(iconKey, size);
    }
  }

  const registerUrl = (id, url) => {
    urls[id] = url;
  };

  const registerLabel = (id, text) => {
    shortStrings[id] = text;
  };

  const registerDesc = (id, text) => {
    longStrings[id] = text;
  };

  registerUrl('GetStarted.LearnMoreUrl', baseUrl);
  registerUrl(urlResId('Open'), `${baseUrl}/${OPEN_BUTTON.url}`);
  registerLabel('GetStarted.Title', 'Bienvenue dans Smart Cleaner AI');
  registerLabel('Tab.Label', 'Smart Cleaner AI');
  registerLabel(labelResId('Open'), OPEN_BUTTON.label);
  registerDesc('GetStarted.Description', 'Nettoyez et restructurez vos données sans jamais écraser vos feuilles existantes.');
  registerDesc(descResId('Open'), OPEN_BUTTON.desc);

  let groupsXml = '';

  // Groupe Ouvrir (conservé — point 2 en investigation)
  groupsXml += `
              <Group id="GroupOpen">
                <Label resid="${labelResId('OpenGroup')}"/>
                ${iconXml(OPEN_BUTTON.icon)}
                <Control xsi:type="Button" id="${OPEN_BUTTON.id}">
                  <Label resid="${labelResId('Open')}"/>
                  <Supertip>
                    <Title resid="${labelResId('Open')}"/>
                    <Description resid="${descResId('Open')}"/>
                  </Supertip>
                  ${iconXml(OPEN_BUTTON.icon)}
                  <Action xsi:type="ShowTaskpane">
                    <TaskpaneId>${RIBBON_BASE.taskpaneId}</TaskpaneId>
                    <SourceLocation resid="${urlResId('Open')}"/>
                  </Action>
                </Control>
              </Group>`;
  registerLabel(labelResId('OpenGroup'), 'Smart Cleaner AI');

  for (const group of RIBBON_GROUPS) {
    const groupIcon = group.controls[0]?.icon ?? 'app';
    groupsXml += `
              <Group id="${group.id}">
                <Label resid="${labelResId(group.id)}"/>
                ${iconXml(groupIcon)}`;

    registerLabel(labelResId(group.id), group.label);

    for (const control of group.controls) {
      if (control.type === 'button') {
        const urlId = urlResId(control.id);
        registerUrl(urlId, taskpaneUrl(baseUrl, control.view, control.action));
        registerLabel(labelResId(control.id), control.label);
        registerDesc(descResId(control.id), control.desc);

        groupsXml += `
                <Control xsi:type="Button" id="${control.id}">
                  <Label resid="${labelResId(control.id)}"/>
                  <Supertip>
                    <Title resid="${labelResId(control.id)}"/>
                    <Description resid="${descResId(control.id)}"/>
                  </Supertip>
                  ${iconXml(control.icon)}
                  <Action xsi:type="ShowTaskpane">
                    <TaskpaneId>${RIBBON_BASE.taskpaneId}</TaskpaneId>
                    <SourceLocation resid="${urlId}"/>
                  </Action>
                </Control>`;
      }

      if (control.type === 'menu') {
        registerLabel(labelResId(control.id), control.label);
        registerDesc(descResId(control.id), control.desc);

        groupsXml += `
                <Control xsi:type="Menu" id="${control.id}">
                  <Label resid="${labelResId(control.id)}"/>
                  <Supertip>
                    <Title resid="${labelResId(control.id)}"/>
                    <Description resid="${descResId(control.id)}"/>
                  </Supertip>
                  ${iconXml(control.icon)}
                  <Items>`;

        for (const item of control.items) {
          const urlId = urlResId(item.id);
          registerUrl(urlId, taskpaneUrl(baseUrl, item.view, item.action));
          registerLabel(labelResId(item.id), item.label);
          registerDesc(descResId(item.id), item.label);

          const itemIconXml = item.icon ? iconXml(item.icon) : '';

          groupsXml += `
                    <Item id="${item.id}">
                      <Label resid="${labelResId(item.id)}"/>
                      <Supertip>
                        <Title resid="${labelResId(item.id)}"/>
                        <Description resid="${descResId(item.id)}"/>
                      </Supertip>
                      ${itemIconXml}
                      <Action xsi:type="ShowTaskpane">
                        <TaskpaneId>${RIBBON_BASE.taskpaneId}</TaskpaneId>
                        <SourceLocation resid="${urlId}"/>
                      </Action>
                    </Item>`;
        }

        groupsXml += `
                  </Items>
                </Control>`;
      }
    }

    groupsXml += `
              </Group>`;
  }

  const urlsXml = Object.entries(urls)
    .map(([id, url]) => `        <bt:Url id="${id}" DefaultValue="${xmlEscape(url)}"/>`)
    .join('\n');

  const shortXml = Object.entries(shortStrings)
    .map(([id, text]) => `        <bt:String id="${id}" DefaultValue="${xmlEscape(text)}"/>`)
    .join('\n');

  const longXml = Object.entries(longStrings)
    .map(([id, text]) => `        <bt:String id="${id}" DefaultValue="${xmlEscape(text)}"/>`)
    .join('\n');

  const imagesXml = Object.entries(imageUrls)
    .map(([id, url]) => `        <bt:Image id="${id}" DefaultValue="${xmlEscape(url)}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
  xmlns:ov="http://schemas.microsoft.com/office/taskpaneappversionoverrides"
  xsi:type="TaskPaneApp">

  <Id>${RIBBON_BASE.id}</Id>
  <Version>${RIBBON_BASE.version}</Version>
  <ProviderName>Smart Cleaner AI</ProviderName>
  <DefaultLocale>fr-FR</DefaultLocale>
  <DisplayName DefaultValue="Smart Cleaner AI"/>
  <Description DefaultValue="Nettoyage et restructuration de données intelligent propulsé par IA."/>
  <IconUrl DefaultValue="${baseUrl}/assets/${iconFileName('app', 32)}"/>
  <HighResolutionIconUrl DefaultValue="${baseUrl}/assets/${iconFileName('app', 80)}"/>
  <SupportUrl DefaultValue="${baseUrl}"/>

  <AppDomains>
    <AppDomain>${baseUrl}</AppDomain>
  </AppDomains>

  <Hosts>
    <Host Name="Workbook"/>
  </Hosts>

  <DefaultSettings>
    <SourceLocation DefaultValue="${xmlEscape(baseUrl + '/taskpane.html?view=home')}"/>
  </DefaultSettings>

  <Permissions>ReadWriteDocument</Permissions>

  <VersionOverrides xmlns="http://schemas.microsoft.com/office/taskpaneappversionoverrides" xsi:type="VersionOverridesV1_0">
    <Hosts>
      <Host xsi:type="Workbook">
        <DesktopFormFactor>
          <GetStarted>
            <Title resid="GetStarted.Title"/>
            <Description resid="GetStarted.Description"/>
            <LearnMoreUrl resid="GetStarted.LearnMoreUrl"/>
          </GetStarted>

          <ExtensionPoint xsi:type="PrimaryCommandSurface">
            <CustomTab id="TabSmartCleanerAI">
${groupsXml}
              <Label resid="Tab.Label"/>
            </CustomTab>
          </ExtensionPoint>
        </DesktopFormFactor>
      </Host>
    </Hosts>

    <Resources>
      <bt:Images>
${imagesXml}
      </bt:Images>

      <bt:Urls>
${urlsXml}
      </bt:Urls>

      <bt:ShortStrings>
${shortXml}
      </bt:ShortStrings>

      <bt:LongStrings>
${longXml}
      </bt:LongStrings>
    </Resources>
  </VersionOverrides>
</OfficeApp>
`;
}

const prod = buildManifest('https://mes-outils-excel.vercel.app');
const dev = buildManifest('https://localhost:3000');

fs.writeFileSync(path.join(root, 'manifest.xml'), prod, 'utf8');
fs.writeFileSync(path.join(root, 'manifest.dev.xml'), dev, 'utf8');

console.log('✅ manifest.xml et manifest.dev.xml générés.');
