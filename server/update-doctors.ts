import { connectToDatabase } from "./database";
import { User } from "./models";

const newDoctorData = [
  { name: "Khusboo Priya Singh", phone: "+977 9876543210" },
  { name: "Upendra Devkota", phone: "+977 9874156841" },
  { name: "Sanjay Rathi", phone: "+977 9871561320" },
  { name: "Gyanendra Gurung", phone: "+977 9889741000" },
  { name: "Baikuntha Adhikari", phone: "+977 9876543211" },
  { name: "Ashok Koirala", phone: "+977 9874156842" },
];

async function updateDoctors() {
  try {
    await connectToDatabase();

    const doctors = await User.find({ role: 'doctor' });

    for (let i = 0; i < doctors.length; i++) {
      const data = newDoctorData[i % newDoctorData.length];
      await User.findByIdAndUpdate(doctors[i]._id, {
        name: data.name,
        phone: data.phone,
      });
      console.log(`Updated doctor ${doctors[i].name} to ${data.name} with phone ${data.phone}`);
    }

    console.log("All doctors updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error updating doctors:", error);
    process.exit(1);
  }
}

updateDoctors();
