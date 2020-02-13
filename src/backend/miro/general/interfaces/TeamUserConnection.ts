export default interface TeamUserConnection {
  type: 'team-user-connection';
  id: string;
  role: 'non_team' | 'member' | 'admin';
  user: {
    type: 'user';
    id: string;
    name: string;
  };
}
