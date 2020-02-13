export default interface IssueInfo {
  id: string;
  title: string;
  description: string;
  project: {
    uuid: string;
    name: string;
  };
  state?: {
    name: string;
    color: string;
  };
  type: {
    color: string;
    name: string;
    imageUrl?: string;
  };
  assignedTo?: {
    displayName: string;
    avatar: string;
  };
  issueUrl?: string;
}
