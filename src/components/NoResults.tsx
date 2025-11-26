import NoResult from "../assets/images/no-results-found.png";

interface NoResultsProps {
  subheading: string;
}

export const NoResults = ({ subheading }: NoResultsProps) => {
  return (
    <tr>
      <td colSpan={6} className="py-8">
        <div className="w-full flex flex-col justify-center items-center p-12">
          <img
            src={NoResult}
            alt="No Result Icon"
            className={"w-50 h-50 mb-4"}
          />
          <h2 className="font-medium text-(--dark-primary)">
            No results found.
          </h2>
          <h3 className="text-gray-500">{subheading}</h3>
        </div>
      </td>
    </tr>
  );
};
