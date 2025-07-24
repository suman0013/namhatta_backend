import { db } from "./db";
import { devotees, namhattas, devotionalStatuses, namhattaUpdates, addresses, devoteeAddresses, namhattaAddresses } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Sample data for seeding the database
export async function seedDatabase() {
  console.log("Starting database seeding...");

  // Check if we already have enough data
  const existingNamhattas = await db.select().from(namhattas);
  if (existingNamhattas.length >= 50) {
    console.log("Database already has sufficient data, skipping seed");
    return;
  }

  // Clear existing data first to avoid duplicates
  await db.delete(namhattaUpdates);
  await db.delete(devotees);
  await db.delete(namhattas);

  // Get devotional statuses
  const statuses = await db.select().from(devotionalStatuses);
  
  // Sample locations across India
  const locations = [
    { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Ballygunge", village: "Ballygunge", postalCode: "700019" },
    { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Salt Lake", village: "Salt Lake City", postalCode: "700064" },
    { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Howrah", village: "Howrah", postalCode: "711101" },
    { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur", postalCode: "741313" },
    { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Krishnanagar", village: "Krishnanagar", postalCode: "741101" },
    { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Ranaghat", village: "Ranaghat", postalCode: "741201" },
    { country: "India", state: "West Bengal", district: "Darjeeling", subDistrict: "Darjeeling", village: "Darjeeling", postalCode: "734101" },
    { country: "India", state: "West Bengal", district: "Paschim Medinipur", subDistrict: "Kharagpur", village: "Kharagpur", postalCode: "721301" },
    { country: "India", state: "West Bengal", district: "Purba Medinipur", subDistrict: "Tamluk", village: "Tamluk", postalCode: "721636" },
    { country: "India", state: "West Bengal", district: "Purulia", subDistrict: "Purulia", village: "Purulia", postalCode: "723101" },
    { country: "India", state: "West Bengal", district: "Purulia", subDistrict: "Raghunathpur", village: "Raghunathpur", postalCode: "723133" },
    { country: "India", state: "West Bengal", district: "Purulia", subDistrict: "Jhalda", village: "Jhalda", postalCode: "723202" },
    { country: "India", state: "West Bengal", district: "Malda", subDistrict: "Malda", village: "Malda", postalCode: "732101" },
    { country: "India", state: "Odisha", district: "Khordha", subDistrict: "Bhubaneswar", village: "Bhubaneswar", postalCode: "751001" },
    { country: "India", state: "Odisha", district: "Cuttack", subDistrict: "Cuttack", village: "Cuttack", postalCode: "753001" },
    { country: "India", state: "Odisha", district: "Puri", subDistrict: "Puri", village: "Puri", postalCode: "752001" },
    { country: "India", state: "Odisha", district: "Ganjam", subDistrict: "Berhampur", village: "Berhampur", postalCode: "760001" },
    { country: "India", state: "Odisha", district: "Balasore", subDistrict: "Balasore", village: "Balasore", postalCode: "756001" },
    { country: "India", state: "Bihar", district: "Patna", subDistrict: "Patna", village: "Patna", postalCode: "800001" },
    { country: "India", state: "Bihar", district: "Gaya", subDistrict: "Gaya", village: "Gaya", postalCode: "823001" },
    { country: "India", state: "Bihar", district: "Muzaffarpur", subDistrict: "Muzaffarpur", village: "Muzaffarpur", postalCode: "842001" },
    { country: "India", state: "Bihar", district: "Darbhanga", subDistrict: "Darbhanga", village: "Darbhanga", postalCode: "846001" },
    { country: "India", state: "Bihar", district: "Bhagalpur", subDistrict: "Bhagalpur", village: "Bhagalpur", postalCode: "812001" },
    { country: "India", state: "Jharkhand", district: "Ranchi", subDistrict: "Ranchi", village: "Ranchi", postalCode: "834001" },
    { country: "India", state: "Jharkhand", district: "Dhanbad", subDistrict: "Dhanbad", village: "Dhanbad", postalCode: "826001" },
    { country: "India", state: "Jharkhand", district: "Jamshedpur", subDistrict: "Jamshedpur", village: "Jamshedpur", postalCode: "831001" },
    { country: "India", state: "Jharkhand", district: "Bokaro", subDistrict: "Bokaro", village: "Bokaro", postalCode: "827001" },
    { country: "India", state: "Jharkhand", district: "Deoghar", subDistrict: "Deoghar", village: "Deoghar", postalCode: "814001" }
  ];

  // Sample Indian names
  const maleNames = [
    "Rajesh Kumar", "Amit Sharma", "Sunil Gupta", "Ravi Singh", "Prakash Mishra", "Manoj Yadav", "Vinod Tiwari", "Ashok Pandey",
    "Santosh Kumar", "Deepak Verma", "Mukesh Agarwal", "Ramesh Jha", "Naresh Sinha", "Dinesh Roy", "Pankaj Das", "Anand Ghosh",
    "Bijoy Chatterjee", "Subhas Banerjee", "Tapan Mukherjee", "Goutam Sengupta", "Partha Sarkar", "Dipak Dutta", "Ranjan Pal",
    "Samir Bhattacharya", "Tarun Chakraborty", "Nirmal Bose", "Pradip Mitra", "Sanjib Mondal", "Debasis Majumdar", "Swapan Biswas",
    "Ajit Patel", "Kiran Shah", "Nitin Joshi", "Rohit Thakur", "Sachin Rana", "Vikash Choudhary", "Arun Bhardwaj", "Sushil Kapoor",
    "Rajendra Nath", "Mahendra Prasad", "Surendra Babu", "Narendra Reddy", "Upendra Rao", "Devendra Nair", "Jitendra Pillai"
  ];

  const femaleNames = [
    "Sunita Devi", "Geeta Sharma", "Rekha Gupta", "Meera Singh", "Kavita Mishra", "Anjali Yadav", "Priya Tiwari", "Shanti Pandey",
    "Usha Kumar", "Radha Verma", "Sita Agarwal", "Lakshmi Jha", "Saraswati Sinha", "Durga Roy", "Kali Das", "Parvati Ghosh",
    "Malati Chatterjee", "Kamala Banerjee", "Shyama Mukherjee", "Bela Sengupta", "Mira Sarkar", "Lila Dutta", "Nila Pal",
    "Sujata Bhattacharya", "Ruma Chakraborty", "Suma Bose", "Puja Mitra", "Ritu Mondal", "Kiran Majumdar", "Hema Biswas",
    "Nita Patel", "Lata Shah", "Gita Joshi", "Asha Thakur", "Sushma Rana", "Pushpa Choudhary", "Kamla Bhardwaj", "Shoba Kapoor",
    "Vijaya Nath", "Indira Prasad", "Savita Babu", "Lalita Reddy", "Sunanda Rao", "Vidya Nair", "Sharda Pillai"
  ];

  // Sample initiated names
  const initiatedNames = [
    "Hari Bhakta Das", "Krishna Prema Das", "Gauranga Das", "Nitai Das", "Radha Govinda Das", "Vrindavan Das", "Govardhan Das",
    "Jagannath Das", "Balarama Das", "Subhadra Devi", "Radharani Devi", "Vrinda Devi", "Tulasi Devi", "Ganga Devi", "Yamuna Devi",
    "Saraswati Devi", "Lakshmi Devi", "Sita Devi", "Rukmini Devi", "Draupadi Devi", "Kunti Devi", "Gandhari Devi", "Mandodari Devi",
    "Arjuna Das", "Bhima Das", "Nakula Das", "Sahadeva Das", "Yudhisthira Das", "Hanuman Das", "Garuda Das", "Narada Das",
    "Prahlada Das", "Dhruva Das", "Bharata Das", "Laxmana Das", "Shatrughna Das", "Vibhishana Das", "Jatayu Das", "Sampati Das"
  ];

  // Sample leadership roles
  const leadershipRoles = [
    "Prabhu Lal Sharma", "Mataji Sita Devi", "Prabhu Ram Kumar", "Mataji Gita Devi", "Prabhu Shyam Das",
    "Mataji Radha Devi", "Prabhu Govinda Das", "Mataji Krishna Devi", "Prabhu Hari Das", "Mataji Tulasi Devi"
  ];

  // Generate 100 Namhattas
  const namhattasData = [];
  for (let i = 1; i <= 100; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const president = leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)];
    const vicePresident = leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)];
    const secretary = leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)];
    
    namhattasData.push({
      code: `NAM${String(i).padStart(3, '0')}`,
      name: `${location.village} Namhatta`,
      meetingDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][Math.floor(Math.random() * 7)],
      meetingTime: `${Math.floor(Math.random() * 12) + 6}:${Math.random() > 0.5 ? "00" : "30"} ${Math.random() > 0.5 ? "AM" : "PM"}`,
      malaSenapoti: Math.random() > 0.7 ? leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)] : null,
      mahaChakraSenapoti: Math.random() > 0.8 ? leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)] : null,
      chakraSenapoti: Math.random() > 0.9 ? leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)] : null,
      upaChakraSenapoti: Math.random() > 0.9 ? leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)] : null,
      secretary: Math.random() > 0.5 ? leadershipRoles[Math.floor(Math.random() * leadershipRoles.length)] : null,
      status: Math.random() > 0.1 ? "APPROVED" : "PENDING_APPROVAL",
      createdAt: new Date(),
      updatedAt: new Date(),
      location // Store location separately for address creation
    });
  }

  // Insert Namhattas
  console.log("Inserting Namhattas...");
  for (const namhattaItem of namhattasData) {
    const { location, ...namhattaFields } = namhattaItem;
    
    // Insert the namhatta
    const [insertedNamhatta] = await db.insert(namhattas).values(namhattaFields).returning();
    
    // Create or find address
    let address = await db.select().from(addresses).where(
      and(
        eq(addresses.country, location.country),
        eq(addresses.stateNameEnglish, location.state),
        eq(addresses.districtNameEnglish, location.district),
        eq(addresses.subdistrictNameEnglish, location.subDistrict),
        eq(addresses.villageNameEnglish, location.village),
        eq(addresses.pincode, location.postalCode)
      )
    ).limit(1);
    
    if (address.length === 0) {
      // Insert new address
      [address[0]] = await db.insert(addresses).values({
        country: location.country,
        stateNameEnglish: location.state,
        districtNameEnglish: location.district,
        subdistrictNameEnglish: location.subDistrict,
        villageNameEnglish: location.village,
        pincode: location.postalCode
      }).returning();
    }
    
    // Link namhatta to address
    await db.insert(namhattaAddresses).values({
      namhattaId: insertedNamhatta.id,
      addressId: address[0].id,
      landmark: `Near ${location.village} Center`
    });
  }

  // Get all inserted Namhattas
  const insertedNamhattas = await db.select().from(namhattas);
  
  // Generate 250 devotees
  const devoteeData = [];
  for (let i = 1; i <= 250; i++) {
    const isInitiated = Math.random() > 0.3; // 70% chance of being initiated
    const isMale = Math.random() > 0.4; // 60% male, 40% female
    const legalName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const initiatedName = isInitiated ? initiatedNames[Math.floor(Math.random() * initiatedNames.length)] : null;
    const statusId = Math.floor(Math.random() * statuses.length) + 1;
    const namhattaId = insertedNamhattas[Math.floor(Math.random() * insertedNamhattas.length)].id;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    devoteeData.push({
      legalName,
      initiatedName,
      dob: new Date(1950 + Math.random() * 50, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      gender: isMale ? "MALE" : "FEMALE",
      bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][Math.floor(Math.random() * 8)],
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `${legalName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      occupation: ["Teacher", "Engineer", "Doctor", "Farmer", "Business", "Student", "Retired", "Housewife", "Government Service"][Math.floor(Math.random() * 9)],
      fatherName: maleNames[Math.floor(Math.random() * maleNames.length)],
      motherName: femaleNames[Math.floor(Math.random() * femaleNames.length)],
      husbandName: Math.random() > 0.5 ? (isMale ? femaleNames[Math.floor(Math.random() * femaleNames.length)] : maleNames[Math.floor(Math.random() * maleNames.length)]) : null,
      presentAddress: location,
      permanentAddress: Math.random() > 0.7 ? locations[Math.floor(Math.random() * locations.length)] : location,
      devotionalStatusId: statusId,
      harinamDate: isInitiated ? new Date(2000 + Math.random() * 24, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : null,
      devotionalCourses: Math.random() > 0.6 ? [{ name: `Course ${Math.floor(Math.random() * 10) + 1}`, date: new Date().toISOString().split('T')[0], institute: "ISKCON" }] : [],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Insert devotees
  console.log("Inserting devotees...");
  for (const devotee of devoteeData) {
    await db.insert(devotees).values(devotee);
  }

  // Add District Supervisors to leaders table
  console.log("Adding District Supervisors...");
  const districtSupervisors = [
    { name: "District Supervisor - Nadia", role: "DISTRICT_SUPERVISOR", location: { state: "West Bengal", district: "Nadia" } },
    { name: "District Supervisor - Kolkata", role: "DISTRICT_SUPERVISOR", location: { state: "West Bengal", district: "Kolkata" } },
    { name: "District Supervisor - Khordha", role: "DISTRICT_SUPERVISOR", location: { state: "Odisha", district: "Khordha" } },
    { name: "District Supervisor - Cuttack", role: "DISTRICT_SUPERVISOR", location: { state: "Odisha", district: "Cuttack" } },
    { name: "District Supervisor - Puri", role: "DISTRICT_SUPERVISOR", location: { state: "Odisha", district: "Puri" } },
    { name: "District Supervisor - Patna", role: "DISTRICT_SUPERVISOR", location: { state: "Bihar", district: "Patna" } },
    { name: "District Supervisor - Gaya", role: "DISTRICT_SUPERVISOR", location: { state: "Bihar", district: "Gaya" } },
    { name: "District Supervisor - Ranchi", role: "DISTRICT_SUPERVISOR", location: { state: "Jharkhand", district: "Ranchi" } },
    { name: "District Supervisor - Dhanbad", role: "DISTRICT_SUPERVISOR", location: { state: "Jharkhand", district: "Dhanbad" } },
    { name: "District Supervisor - Bokaro", role: "DISTRICT_SUPERVISOR", location: { state: "Jharkhand", district: "Bokaro" } },
    { name: "District Supervisor - Darjeeling", role: "DISTRICT_SUPERVISOR", location: { state: "West Bengal", district: "Darjeeling" } },
    { name: "District Supervisor - Howrah", role: "DISTRICT_SUPERVISOR", location: { state: "West Bengal", district: "Howrah" } },
  ];

  for (const supervisor of districtSupervisors) {
    await db.insert(leaders).values(supervisor);
  }

  // Generate 50 updates
  const updateData = [];
  const programTypes = ["Satsang", "Kirtan", "Bhagavad Gita Class", "Srimad Bhagavatam Class", "Harinam Sankirtan", "Prasadam Distribution", "Book Distribution", "Mangal Arati"];
  
  for (let i = 1; i <= 50; i++) {
    const namhatta = insertedNamhattas[Math.floor(Math.random() * insertedNamhattas.length)];
    const programType = programTypes[Math.floor(Math.random() * programTypes.length)];
    const attendance = Math.floor(Math.random() * 100) + 10;
    const date = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Random date within last 6 months
    
    updateData.push({
      namhattaId: namhatta.id,
      programType,
      date: date.toISOString().split('T')[0],
      attendance,
      specialAttraction: Math.random() > 0.5 ? `Special ${programType} program with guest speaker` : null,
      prasadDistribution: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 10 : null,
      bookDistribution: Math.random() > 0.4,
      nagarKirtan: Math.random() > 0.5,
      chanting: Math.random() > 0.6,
      arati: Math.random() > 0.7,
      bhagwatPath: Math.random() > 0.8,
      createdAt: new Date(date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Insert updates
  console.log("Inserting updates...");
  for (const update of updateData) {
    await db.insert(namhattaUpdates).values(update);
  }

  console.log(`Database seeded successfully with:
  - ${namhattaData.length} Namhattas
  - ${devoteeData.length} Devotees  
  - ${updateData.length} Updates`);
}