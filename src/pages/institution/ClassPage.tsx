import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { getClass } from "@/services/classes";
import { routes, path } from "@/lib/routes";

/** 32 · Generic class page — routes to the right typed view. */
export default function ClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    getClass(id).then((c) => {
      if (!c) return;
      const target = c.my_role === "student"
        ? routes.studentClassPage
        : c.class_type === "studio"
          ? routes.studioClassPage
          : routes.theoreticalClassPage;
      navigate(path(target, { id }), { replace: true });
    });
  }, [id, navigate]);

  return (
    <MobileShell>
      <BackHeader title="Class" />
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <Meta>Loading class…</Meta>
      </div>
    </MobileShell>
  );
}
