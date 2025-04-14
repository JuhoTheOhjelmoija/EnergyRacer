import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | EnergyRacer",
  description: "Terms of Service for EnergyRacer application",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-sm max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-4">1. General</h2>
        <p>
          These Terms of Service govern the use of the EnergyRacer application ("Service"). By using the Service, 
          you accept these terms and agree to comply with them.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Service Description</h2>
        <p>
          EnergyRacer is an application that helps users track their caffeine consumption and compete with 
          other users. The Service provides tools for monitoring, analyzing, and comparing caffeine consumption.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. User Responsibility</h2>
        <p>
          Users are responsible for the accuracy of the information they provide and for using the Service 
          responsibly. Users agree not to misuse the Service or interfere with its operation.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Usage</h2>
        <p>
          The Service collects and processes user data in accordance with the Privacy Policy. Users consent 
          to their data being processed for the purposes of the Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms. Changes will be announced in the Service, and by 
          continuing to use the Service after changes, you accept the updated terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
        <p>
          The Service is provided "as is". We are not liable for any interruptions, errors, or potential 
          damages to users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">7. Applicable Law</h2>
        <p>
          These terms are governed by Finnish law.
        </p>

        <div className="mt-8 text-sm text-gray-600">
          <p>Last updated: April 15, 2024</p>
        </div>
      </div>
    </div>
  )
} 