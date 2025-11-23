import { useBreadcrumb } from "@refinedev/core";
import { Link } from "react-router";

export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  return (
    <>
      <ul className="flex capitalize">
        {breadcrumbs.map((breadcrumb, index) => {
          return (
            <li
              key={`breadcrumb-${breadcrumb.label}`}
              className="text-[var(--primary)] text-xl font-bold flex flex-row"
            >
              {breadcrumb.href ? (
                <Link
                  to={breadcrumb.href}
                  className="hover:text-[var(--primary-hover)] transition-all duration-300"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span>{breadcrumb.label}</span>
              )}

              {index < breadcrumbs.length - 1 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
