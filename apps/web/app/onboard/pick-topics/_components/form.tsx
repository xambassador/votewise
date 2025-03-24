import { Button } from "@votewise/ui/button";

import { Footer } from "../../_components/footer";

type Props = { topics: { id: string; name: string }[] };

export function Topics(props: Props) {
  const { topics } = props;
  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center flex-wrap gap-4 justify-center">
        {topics.map((topic) => (
          <Button variant="outline" key={topic.id}>
            {topic.name}
          </Button>
        ))}
      </div>
      <Footer />
    </div>
  );
}
