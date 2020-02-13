import * as miro from '@miro/client-sdk';
import IssueInfo from '../../../common/dto/IssueInfo';
import AddonApiService from '../../common/services/addon-api.service';
import IssueLinkInfo from '../../../common/dto/IssueLinkInfo';
import issueInfoToMiroCardData from '../../../common/utils/issueInfoToMiroCardData';
import {
  LAUNCH_ICO_SVG,
  LIBRARY_ICO_SVG,
  TOOLBAR_ICO_SVG,
} from '../../../common/consts';
import {
  IAzureCardWidgetData,
  isAzureCardWidgetData,
} from '../../../common/general/IAzureCardWidgetData';

let boardInfo: miro.IBoardInfo;
let addonApi: AddonApiService = new AddonApiService();

async function onWidgetsCreated(e: miro.Event) {
  const widgets = e.data as miro.IBaseWidget[];
  const newAzureCards: IAzureCardWidgetData[] = widgets.filter(
    isAzureCardWidgetData.bind(this, MIRO_APP_CLIENT_ID),
  );
  if (newAzureCards.length) {
    const linksInfo: IssueLinkInfo[] = [];

    newAzureCards.forEach(card => {
      const meta = card.metadata[MIRO_APP_CLIENT_ID];
      linksInfo.push({
        boardKey: boardInfo.id,
        widgetId: card.id,
        issueId: meta.issueId,
      });
    });

    addonApi.createLinks(linksInfo);
  }
}

async function onAzurePickerBtnClicked() {
  const issues: IssueInfo[] = await miro.board.ui.openModal(
    'issue-picker.html',
    {
      maxWidth: 1000,
      maxHeight: 660,
    },
  );
  if (issues && issues.length) {
    const viewport = await miro.board.viewport.getViewport();
    const sdkData = issues.map((issue, index) => {
      return issueInfoToMiroCardData(MIRO_APP_CLIENT_ID, issue, {
        x: viewport.x + viewport.width / 2 + index * 50,
        y: viewport.y + viewport.height / 2 + index * 50,
      });
    });
    miro.board.widgets.create(<any>sdkData);
  }
}

miro.onReady(async () => {
  boardInfo = await miro.board.info.get();
  miro.addListener('WIDGETS_CREATED', onWidgetsCreated);
  miro.initialize({
    extensionPoints: {
      toolbar: {
        title: 'Azure Cards',
        librarySvgIcon: LIBRARY_ICO_SVG,
        toolbarSvgIcon: TOOLBAR_ICO_SVG,
        onClick: onAzurePickerBtnClicked,
      },
      getWidgetMenuItems: function(widgets: miro.IBaseWidget[]) {
        const menuItems: miro.IContextMenuItem[] = [];

        if (
          widgets.length === 1 &&
          isAzureCardWidgetData(MIRO_APP_CLIENT_ID, widgets[0])
        ) {
          const menuItem: miro.IContextMenuItem = {
            tooltip: 'source',
            svgIcon: LAUNCH_ICO_SVG,
            onClick: () => {
              const { issueUrl } = widgets[0].metadata[MIRO_APP_CLIENT_ID];
              if (issueUrl) {
                window.open(
                  widgets[0].metadata[MIRO_APP_CLIENT_ID].issueUrl,
                  '_blank',
                );
              }
            },
          };
          menuItems.push(menuItem);
        }

        return Promise.resolve(menuItems);
      },
    },
  });
});
