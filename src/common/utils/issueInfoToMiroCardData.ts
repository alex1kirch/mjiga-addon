import IssueInfo from '../dto/IssueInfo';
import { LOGO_ICO_BASE64, UNASSIGNED_ICO_BASE64 } from '../consts';
import { IAzureCardWidgetData } from '../general/IAzureCardWidgetData';
import { cutOffText } from './textUtils';

export default function issueInfoToMiroCardData(
  appClientId: string,
  issue: IssueInfo,
  coords?: { x: number; y: number },
): Partial<IAzureCardWidgetData> {
  const isUnassigned = !issue.assignedTo;
  const result: Partial<IAzureCardWidgetData> = {
    type: 'CARD',
    title: cutOffText(issue.title),
    description: cutOffText(issue.description),
    metadata: {
      [appClientId]: {
        issueId: issue.id,
        projectUuid: issue.project.uuid,
        issueUrl: issue.issueUrl,
      },
    },
    card: {
      customFields: [
        {
          value: `ID ${issue.id}`,
        },
        {
          value: issue.type.name,
          mainColor: '#ffffff',
          iconUrl: issue.type.imageUrl,
        },
        {
          value: issue.state!.name,
          mainColor: issue.state!.color.toLowerCase(),
          fontColor: '#ffffff',
        },
        {
          value: isUnassigned ? 'Unassigned' : issue.assignedTo!.displayName,
          iconUrl: isUnassigned
            ? UNASSIGNED_ICO_BASE64
            : issue.assignedTo!.avatar,
          roundedIcon: true,
        },
      ],
      logo: {
        iconUrl: LOGO_ICO_BASE64,
      },
    },
    style: {
      backgroundColor: issue.type.color.toLowerCase(),
    },
    capabilities: { editable: false },
  };

  if (coords) {
    result.x = coords.x;
    result.y = coords.y;
  }

  return result;
}
