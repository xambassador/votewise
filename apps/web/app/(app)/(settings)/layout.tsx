import { Authorized } from "@/components/auth";
import { Container } from "@/components/container";

export default function Layout(props: React.PropsWithChildren) {
  return (
    <Authorized>
      <Container>
        <div className="tab-container" />
        <div className="p-6 rounded-xl border border-nobelBlack-200 bg-nobelBlack-100 flex flex-col gap-7">
          {props.children}
        </div>
      </Container>
    </Authorized>
  );
}
