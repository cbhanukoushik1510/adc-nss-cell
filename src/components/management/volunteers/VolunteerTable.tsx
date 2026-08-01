import { volunteers } from "@/data/volunteers";
import VolunteerRow from "./VolunteerRow";
import Pagination from "./Pagination";
import TableToolbar from "./TableToolbar";
export default function VolunteerTable() {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-md">
<TableToolbar />
      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[#0F2B7B] text-white">

            <tr>

              <th className="px-6 py-4 text-left">Volunteer</th>

              <th className="px-6 py-4 text-left">Roll No</th>

              <th className="px-6 py-4 text-left">Department</th>

              <th className="px-6 py-4 text-left">Year</th>

              <th className="px-6 py-4 text-left">Unit</th>

              <th className="px-6 py-4 text-left">Status</th>

              <th className="px-6 py-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {volunteers.map((volunteer) => (
              <VolunteerRow
                key={volunteer.id}
                volunteer={volunteer}
              />
            ))}

          </tbody>

        </table>

      </div>
<Pagination />
    </section>
  );
}