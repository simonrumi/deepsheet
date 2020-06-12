const titleMutation = `mutation ChangeTitle($id: ID!, $title: String) {
  changeTitle(id: $id, title: $title) {
    id
    title
  }
}`;
export default titleMutation;
