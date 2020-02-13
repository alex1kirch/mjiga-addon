import * as miro from '@miro/client-sdk';

export type AzureCardMeta = {
  issueId: string;
  projectUuid: string;
  issueUrl?: string;
};

export interface IAzureCardWidgetData extends miro.ICardWidgetData {
  metadata: {
    [clientId: string]: AzureCardMeta;
  };
}

export function isAzureCardWidgetData(
  appClientId: string,
  widget: miro.IBaseWidget,
): widget is IAzureCardWidgetData {
  return (
    widget.type === 'CARD' &&
    widget.metadata &&
    widget.metadata[appClientId] &&
    isAzureCardMeta(widget.metadata[appClientId])
  );
}

export function isAzureCardMeta(meta: any): meta is AzureCardMeta {
  return meta.issueId !== void 0 && meta.projectUuid !== void 0;
}
