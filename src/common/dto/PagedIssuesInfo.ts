import IssueInfo from './IssueInfo';

export default interface IPagedIssuesInfo {
  issues: IssueInfo[];
  total: number;
}
