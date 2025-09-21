import { GroupFetcher } from "./_components/group-fetcher";
import { GroupView } from "./_components/group-view";

type Props = { params: { id: string } };

export default async function Page(props: Props) {
  const { id } = props.params;
  return <GroupFetcher id={id}>{(data) => <GroupView group={data} id={id} />}</GroupFetcher>;
}
