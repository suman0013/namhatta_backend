import { db } from "./db";
import { devotees, namhattas, devotionalStatuses, shraddhakutirs, namhattaUpdates, leaders, statusHistory, addresses, devoteeAddresses, namhattaAddresses } from "@shared/schema";
import { Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory } from "@shared/schema";
import { sql, eq, desc, asc, and, or, like, count, inArray, ne, isNotNull } from "drizzle-orm";
import { IStorage } from "./storage-fresh";
import { seedDatabase } from "./seed-data";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if data already exists
    const existingStatuses = await db.select().from(devotionalStatuses).limit(1);
    
    if (existingStatuses.length === 0) {
      // Initialize devotional statuses
      const statusData = [
        { name: "Shraddhavan" },
        { name: "Sadhusangi" },
        { name: "Gour/Krishna Sevak" },
        { name: "Gour/Krishna Sadhak" },
        { name: "Sri Guru Charan Asraya" },
        { name: "Harinam Diksha" },
        { name: "Pancharatrik Diksha" }
      ];

      for (const status of statusData) {
        await db.insert(devotionalStatuses).values(status);
      }

      // Initialize leaders
      const leadersData = [
        { name: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada", role: "FOUNDER_ACHARYA", reportingTo: null, location: { country: "India" } },
        { name: "His Holiness Jayapataka Swami", role: "GBC", reportingTo: 1, location: { country: "India" } },
        { name: "HH Gauranga Prem Swami", role: "REGIONAL_DIRECTOR", reportingTo: 2, location: { country: "India", state: "West Bengal" } },
        { name: "HH Bhaktivilasa Gaurachandra Swami", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
        { name: "HG Padmanetra Das", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
        { name: "District Supervisor - Nadia", role: "DISTRICT_SUPERVISOR", reportingTo: 4, location: { country: "India", state: "West Bengal", district: "Nadia" } },
        { name: "Mala Senapoti - Mayapur", role: "MALA_SENAPOTI", reportingTo: 6, location: { country: "India", state: "West Bengal", district: "Nadia" } }
      ];

      for (const leader of leadersData) {
        await db.insert(leaders).values(leader);
      }

      // Initialize shraddhakutirs
      const shraddhakutirData = [
        { name: "Mayapur Shraddhakutir", districtCode: "NADIA" },
        { name: "Kolkata Shraddhakutir", districtCode: "KOLKATA" },
        { name: "Bhubaneswar Shraddhakutir", districtCode: "KHORDHA" },
        { name: "Patna Shraddhakutir", districtCode: "PATNA" },
        { name: "Ranchi Shraddhakutir", districtCode: "RANCHI" }
      ];

      for (const shraddhakutir of shraddhakutirData) {
        await db.insert(shraddhakutirs).values(shraddhakutir);
      }

      // Seed the database with sample data
      await seedDatabase();
    }
  }

  // Devotees
  async getDevotees(page = 1, size = 10, filters: any = {}): Promise<{ data: Devotee[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [];
    
    if (filters.search) {
      whereConditions.push(
        or(
          like(devotees.legalName, `%${filters.search}%`),
          like(devotees.name, `%${filters.search}%`),
          like(devotees.email, `%${filters.search}%`)
        )
      );
    }
    
    if (filters.statusId) {
      whereConditions.push(eq(devotees.devotionalStatusId, parseInt(filters.statusId)));
    }

    // District filtering for DISTRICT_SUPERVISOR
    if (filters.allowedDistricts && filters.allowedDistricts.length > 0) {
      // Join with devotee_addresses and addresses to filter by district
      const districtSubquery = db
        .select({ devoteeId: devoteeAddresses.devoteeId })
        .from(devoteeAddresses)
        .innerJoin(addresses, eq(devoteeAddresses.addressId, addresses.id))
        .where(inArray(addresses.districtNameEnglish, filters.allowedDistricts));
      
      whereConditions.push(
        inArray(devotees.id, districtSubquery)
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Handle sorting
    let orderBy = asc(devotees.legalName);
    if (filters.sortBy === 'createdAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(devotees.createdAt) : asc(devotees.createdAt);
    } else if (filters.sortBy === 'name') {
      orderBy = filters.sortOrder === 'desc' ? desc(devotees.legalName) : asc(devotees.legalName);
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(devotees).where(whereClause).limit(size).offset(offset).orderBy(orderBy),
      db.select({ count: count() }).from(devotees).where(whereClause)
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    const result = await db.select().from(devotees).where(eq(devotees.id, id)).limit(1);
    const devotee = result[0];
    
    if (!devotee) return undefined;
    
    // Get address information for this devotee
    const addresses = await this.getDevoteeAddresses(id);
    
    // Transform addresses array into presentAddress and permanentAddress properties
    const presentAddr = addresses.find(addr => addr.addressType === 'present');
    const permanentAddr = addresses.find(addr => addr.addressType === 'permanent');
    
    return {
      ...devotee,
      presentAddress: presentAddr ? {
        country: presentAddr.country,
        state: presentAddr.state,
        district: presentAddr.district,
        subDistrict: presentAddr.subDistrict,
        village: presentAddr.village,
        postalCode: presentAddr.postalCode,
        landmark: presentAddr.landmark
      } : undefined,
      permanentAddress: permanentAddr ? {
        country: permanentAddr.country,
        state: permanentAddr.state,
        district: permanentAddr.district,
        subDistrict: permanentAddr.subDistrict,
        village: permanentAddr.village,
        postalCode: permanentAddr.postalCode,
        landmark: permanentAddr.landmark
      } : undefined
    };
  }

  async createDevotee(devoteeData: any): Promise<Devotee> {
    // Extract address information from the request data
    const { presentAddress, permanentAddress, ...devoteeDetails } = devoteeData;
    
    // Create the devotee record first
    const result = await db.insert(devotees).values(devoteeDetails).returning();
    const devotee = result[0];
    
    // Handle present address if provided
    if (presentAddress && (presentAddress.country || presentAddress.state || presentAddress.district || presentAddress.subDistrict || presentAddress.village || presentAddress.postalCode)) {
      const addressId = await this.findOrCreateAddress({
        country: presentAddress.country,
        state: presentAddress.state,
        district: presentAddress.district,
        subDistrict: presentAddress.subDistrict,
        village: presentAddress.village,
        postalCode: presentAddress.postalCode
      });
      
      // Link devotee to present address
      await this.createDevoteeAddress(devotee.id, addressId, 'present', presentAddress.landmark);
    }
    
    // Handle permanent address if provided and different from present address
    if (permanentAddress && (permanentAddress.country || permanentAddress.state || permanentAddress.district || permanentAddress.subDistrict || permanentAddress.village || permanentAddress.postalCode)) {
      const addressId = await this.findOrCreateAddress({
        country: permanentAddress.country,
        state: permanentAddress.state,
        district: permanentAddress.district,
        subDistrict: permanentAddress.subDistrict,
        village: permanentAddress.village,
        postalCode: permanentAddress.postalCode
      });
      
      // Link devotee to permanent address
      await this.createDevoteeAddress(devotee.id, addressId, 'permanent', permanentAddress.landmark);
    }
    
    return devotee;
  }

  async createDevoteeForNamhatta(devoteeData: any, namhattaId: number): Promise<Devotee> {
    // Add namhattaId to the devotee data and use the enhanced createDevotee method
    const devoteeWithNamhatta = { ...devoteeData, namhattaId };
    return await this.createDevotee(devoteeWithNamhatta);
  }

  async updateDevotee(id: number, devoteeData: any): Promise<Devotee> {
    // Extract address information from the request data
    const { presentAddress, permanentAddress, devotionalCourses, ...devoteeDetails } = devoteeData;
    
    // Remove any undefined/null values to avoid database errors
    const cleanDevoteeDetails = Object.fromEntries(
      Object.entries(devoteeDetails).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    // Update the main devotee record
    const result = await db.update(devotees).set(cleanDevoteeDetails).where(eq(devotees.id, id)).returning();
    const updatedDevotee = result[0];
    
    // Handle address updates
    if (presentAddress) {
      // Remove existing present address
      await db.delete(devoteeAddresses).where(
        and(
          eq(devoteeAddresses.devoteeId, id),
          eq(devoteeAddresses.addressType, 'present')
        )
      );
      
      // Add new present address if provided
      if (presentAddress.country || presentAddress.state || presentAddress.district || presentAddress.subDistrict || presentAddress.village || presentAddress.postalCode) {
        const addressId = await this.findOrCreateAddress({
          country: presentAddress.country,
          state: presentAddress.state,
          district: presentAddress.district,
          subDistrict: presentAddress.subDistrict,
          village: presentAddress.village,
          postalCode: presentAddress.postalCode
        });
        
        // Link devotee to present address
        await this.createDevoteeAddress(id, addressId, 'present', presentAddress.landmark);
      }
    }
    
    // Handle permanent address updates
    if (permanentAddress) {
      // Remove existing permanent address
      await db.delete(devoteeAddresses).where(
        and(
          eq(devoteeAddresses.devoteeId, id),
          eq(devoteeAddresses.addressType, 'permanent')
        )
      );
      
      // Add new permanent address if provided
      if (permanentAddress.country || permanentAddress.state || permanentAddress.district || permanentAddress.subDistrict || permanentAddress.village || permanentAddress.postalCode) {
        const addressId = await this.findOrCreateAddress({
          country: permanentAddress.country,
          state: permanentAddress.state,
          district: permanentAddress.district,
          subDistrict: permanentAddress.subDistrict,
          village: permanentAddress.village,
          postalCode: permanentAddress.postalCode
        });
        
        // Link devotee to permanent address
        await this.createDevoteeAddress(id, addressId, 'permanent', permanentAddress.landmark);
      }
    }
    
    return updatedDevotee;
  }

  async getDevoteesByNamhatta(namhattaId: number, page = 1, size = 10, statusId?: number): Promise<{ data: Devotee[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [eq(devotees.namhattaId, namhattaId)];
    if (statusId) {
      whereConditions.push(eq(devotees.devotionalStatusId, statusId));
    }
    const whereClause = and(...whereConditions);

    const [data, totalResult] = await Promise.all([
      db.select().from(devotees).where(whereClause).limit(size).offset(offset),
      db.select({ count: count() }).from(devotees).where(whereClause)
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  async upgradeDevoteeStatus(id: number, newStatusId: number, notes?: string): Promise<void> {
    try {
      // Get current devotee status
      const devotee = await db.select().from(devotees).where(eq(devotees.id, id)).limit(1);
      if (!devotee[0]) {
        throw new Error(`Devotee with ID ${id} not found`);
      }
      const currentStatus = devotee[0]?.devotionalStatusId;
      
      // Update devotee status
      await db.update(devotees).set({ devotionalStatusId: newStatusId }).where(eq(devotees.id, id));
      
      // Record status history - use actual Date object for timestamp
      await db.insert(statusHistory).values({
        devoteeId: id,
        previousStatus: currentStatus?.toString(),
        newStatus: newStatusId.toString(),
        comment: notes,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error in upgradeDevoteeStatus:", error);
      throw error;
    }
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return await db.select().from(statusHistory).where(eq(statusHistory.devoteeId, id)).orderBy(desc(statusHistory.updatedAt));
  }

  async checkDevoteeDistrictAccess(devoteeId: number, allowedDistricts: string[]): Promise<boolean> {
    console.log(`Checking district access for devotee ${devoteeId} with allowed districts: ${allowedDistricts.join(', ')}`);
    
    // If no districts specified, deny access
    if (!allowedDistricts || allowedDistricts.length === 0) {
      console.log('No allowed districts specified, denying access');
      return false;
    }

    // Get devotee's address to check their district
    const devoteeAddressData = await db
      .select({
        district: addresses.districtNameEnglish
      })
      .from(devoteeAddresses)
      .innerJoin(addresses, eq(devoteeAddresses.addressId, addresses.id))
      .where(eq(devoteeAddresses.devoteeId, devoteeId))
      .limit(1);

    console.log(`Found ${devoteeAddressData.length} address records for devotee ${devoteeId}`);

    if (devoteeAddressData.length === 0) {
      // If devotee has no address, allow access (they might be in process of adding address)
      console.log('Devotee has no address, allowing access');
      return true;
    }

    const devoteeDistrict = devoteeAddressData[0].district;
    console.log(`Devotee is in district: ${devoteeDistrict}`);
    
    // Check if devotee's district is in supervisor's allowed districts
    const hasAccess = devoteeDistrict ? allowedDistricts.includes(devoteeDistrict) : false;
    console.log(`Access granted: ${hasAccess}`);
    return hasAccess;
  }

  // Namhattas
  async getNamhattas(page = 1, size = 10, filters: any = {}): Promise<{ data: Namhatta[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [];
    
    if (filters.search) {
      whereConditions.push(like(namhattas.name, `%${filters.search}%`));
    }
    
    if (filters.status) {
      whereConditions.push(eq(namhattas.status, filters.status));
    }

    // District filtering for DISTRICT_SUPERVISOR
    if (filters.allowedDistricts && filters.allowedDistricts.length > 0) {
      // Filter by allowed districts using address relationship
      const allowedDistrictSubquery = db
        .select({ namhattaId: namhattaAddresses.namhattaId })
        .from(namhattaAddresses)
        .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
        .where(inArray(addresses.districtNameEnglish, filters.allowedDistricts));
      
      whereConditions.push(
        inArray(namhattas.id, allowedDistrictSubquery)
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Handle sorting - default to name ascending
    let orderBy = asc(namhattas.name);
    if (filters.sortBy === 'createdAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.createdAt) : asc(namhattas.createdAt);
    } else if (filters.sortBy === 'updatedAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.updatedAt) : asc(namhattas.updatedAt);
    } else if (filters.sortBy === 'name' || !filters.sortBy) {
      // Default to name sorting if no sortBy provided or explicitly name
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.name) : asc(namhattas.name);
    }

    const [data, totalResult] = await Promise.all([
      db.select({
        id: namhattas.id,
        code: namhattas.code,
        name: namhattas.name,
        meetingDay: namhattas.meetingDay,
        meetingTime: namhattas.meetingTime,
        malaSenapoti: namhattas.malaSenapoti,
        mahaChakraSenapoti: namhattas.mahaChakraSenapoti,
        chakraSenapoti: namhattas.chakraSenapoti,
        upaChakraSenapoti: namhattas.upaChakraSenapoti,
        secretary: namhattas.secretary,
        status: namhattas.status,
        createdAt: namhattas.createdAt,
        updatedAt: namhattas.updatedAt,
        devoteeCount: count(devotees.id)
      }).from(namhattas)
        .leftJoin(devotees, eq(namhattas.id, devotees.namhattaId))
        .where(whereClause)
        .groupBy(namhattas.id)
        .limit(size)
        .offset(offset)
        .orderBy(orderBy),
      db.select({ count: count() }).from(namhattas).where(whereClause)
    ]);

    // Fetch address information for each namhatta
    const namhattasWithAddresses = await Promise.all(
      data.map(async (namhatta) => {
        const addressResults = await db.select({
          country: addresses.country,
          state: addresses.stateNameEnglish,
          district: addresses.districtNameEnglish,
          subDistrict: addresses.subdistrictNameEnglish,
          village: addresses.villageNameEnglish,
          postalCode: addresses.pincode,
          landmark: namhattaAddresses.landmark
        }).from(namhattaAddresses)
          .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
          .where(eq(namhattaAddresses.namhattaId, namhatta.id))
          .limit(1);
        
        return {
          ...namhatta,
          address: addressResults[0] ? {
            country: addressResults[0].country,
            state: addressResults[0].state,
            district: addressResults[0].district,
            subDistrict: addressResults[0].subDistrict,
            village: addressResults[0].village,
            postalCode: addressResults[0].postalCode,
            landmark: addressResults[0].landmark
          } : null
        };
      })
    );

    return {
      data: namhattasWithAddresses,
      total: totalResult[0].count
    };
  }

  async getNamhatta(id: number): Promise<Namhatta | undefined> {
    const result = await db.select().from(namhattas).where(eq(namhattas.id, id)).limit(1);
    if (!result[0]) return undefined;
    
    // Fetch address information from normalized tables
    const addressResults = await db.select({
      id: namhattaAddresses.id,
      namhattaId: namhattaAddresses.namhattaId,
      addressId: namhattaAddresses.addressId,
      landmark: namhattaAddresses.landmark,
      country: addresses.country,
      state: addresses.stateNameEnglish,
      district: addresses.districtNameEnglish,
      subDistrict: addresses.subdistrictNameEnglish,
      village: addresses.villageNameEnglish,
      postalCode: addresses.pincode
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .where(eq(namhattaAddresses.namhattaId, id))
      .limit(1);
    
    // Add address information to the namhatta object
    const namhatta = result[0] as any;
    if (addressResults[0]) {
      namhatta.address = {
        country: addressResults[0].country,
        state: addressResults[0].state,
        district: addressResults[0].district,
        subDistrict: addressResults[0].subDistrict,
        village: addressResults[0].village,
        postalCode: addressResults[0].postalCode,
        landmark: addressResults[0].landmark
      };
    }
    
    return namhatta;
  }

  async createNamhatta(namhattaData: any): Promise<Namhatta> {
    // Extract address information from the request data
    const { address, landmark, ...namhattaDetails } = namhattaData;
    
    // Create the namhatta record first
    const result = await db.insert(namhattas).values(namhattaDetails).returning();
    const namhatta = result[0];
    
    // If address information is provided, store it in normalized tables
    if (address && (address.country || address.state || address.district || address.subDistrict || address.village || address.postalCode)) {
      // Use findOrCreateAddress method instead of directly creating
      const addressId = await this.findOrCreateAddress({
        country: address.country,
        state: address.state,
        district: address.district,
        subDistrict: address.subDistrict,
        village: address.village,
        postalCode: address.postalCode
      });
      
      // Link namhatta to address with landmark
      await db.insert(namhattaAddresses).values({
        namhattaId: namhatta.id,
        addressId: addressId,
        landmark: landmark || address.landmark
      });
    }
    
    return namhatta;
  }

  async updateNamhatta(id: number, namhatta: Partial<InsertNamhatta>): Promise<Namhatta> {
    const result = await db.update(namhattas).set(namhatta).where(eq(namhattas.id, id)).returning();
    return result[0];
  }

  async approveNamhatta(id: number): Promise<void> {
    await db.update(namhattas).set({ status: "APPROVED" }).where(eq(namhattas.id, id));
  }

  async rejectNamhatta(id: number, reason?: string): Promise<void> {
    await db.update(namhattas).set({ status: "REJECTED" }).where(eq(namhattas.id, id));
  }

  async getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]> {
    return await db.select().from(namhattaUpdates).where(eq(namhattaUpdates.namhattaId, id)).orderBy(desc(namhattaUpdates.date));
  }

  async getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>> {
    const devoteesByStatus = await db.select({
      statusId: devotees.devotionalStatusId,
      count: count()
    }).from(devotees).where(eq(devotees.namhattaId, id)).groupBy(devotees.devotionalStatusId);

    const statusCounts: Record<string, number> = {};
    for (const item of devoteesByStatus) {
      const status = await db.select().from(devotionalStatuses).where(eq(devotionalStatuses.id, item.statusId)).limit(1);
      if (status[0]) {
        statusCounts[status[0].name] = item.count;
      }
    }

    return statusCounts;
  }

  async getNamhattaStatusHistory(id: number, page = 1, size = 10): Promise<{ data: StatusHistory[], total: number }> {
    const offset = (page - 1) * size;
    
    // Get devotees for this namhatta first
    const namhattaDevotees = await db.select({ id: devotees.id }).from(devotees).where(eq(devotees.namhattaId, id));
    const devoteeIds = namhattaDevotees.map(d => d.id);
    
    if (devoteeIds.length === 0) {
      return { data: [], total: 0 };
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(statusHistory).where(inArray(statusHistory.devoteeId, devoteeIds)).limit(size).offset(offset).orderBy(desc(statusHistory.updatedAt)),
      db.select({ count: count() }).from(statusHistory).where(inArray(statusHistory.devoteeId, devoteeIds))
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  // Statuses
  async getDevotionalStatuses(): Promise<DevotionalStatus[]> {
    return await db.select().from(devotionalStatuses);
  }

  async createDevotionalStatus(status: InsertDevotionalStatus): Promise<DevotionalStatus> {
    const result = await db.insert(devotionalStatuses).values(status).returning();
    return result[0];
  }

  async renameDevotionalStatus(id: number, newName: string): Promise<void> {
    await db.update(devotionalStatuses).set({ name: newName }).where(eq(devotionalStatuses.id, id));
  }

  // Shraddhakutirs
  async getShraddhakutirs(): Promise<Shraddhakutir[]> {
    return await db.select().from(shraddhakutirs);
  }

  async createShraddhakutir(shraddhakutir: InsertShraddhakutir): Promise<Shraddhakutir> {
    const result = await db.insert(shraddhakutirs).values(shraddhakutir).returning();
    return result[0];
  }

  // Updates
  async createNamhattaUpdate(update: InsertNamhattaUpdate): Promise<NamhattaUpdate> {
    const result = await db.insert(namhattaUpdates).values(update).returning();
    return result[0];
  }

  async getAllUpdates(): Promise<Array<NamhattaUpdate & { namhattaName: string }>> {
    const result = await db.select({
      id: namhattaUpdates.id,
      namhattaId: namhattaUpdates.namhattaId,
      programType: namhattaUpdates.programType,
      date: namhattaUpdates.date,
      attendance: namhattaUpdates.attendance,
      prasadDistribution: namhattaUpdates.prasadDistribution,
      nagarKirtan: namhattaUpdates.nagarKirtan,
      bookDistribution: namhattaUpdates.bookDistribution,
      chanting: namhattaUpdates.chanting,
      arati: namhattaUpdates.arati,
      bhagwatPath: namhattaUpdates.bhagwatPath,
      imageUrls: namhattaUpdates.imageUrls,
      facebookLink: namhattaUpdates.facebookLink,
      youtubeLink: namhattaUpdates.youtubeLink,
      specialAttraction: namhattaUpdates.specialAttraction,
      createdAt: namhattaUpdates.createdAt,
      namhattaName: namhattas.name
    }).from(namhattaUpdates)
      .innerJoin(namhattas, eq(namhattaUpdates.namhattaId, namhattas.id))
      .orderBy(desc(namhattaUpdates.date));
    
    return result;
  }

  // Hierarchy
  async getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
    districtSupervisors: Leader[];
    malaSenapotis: Leader[];
  }> {
    const [founder, gbc, regionalDirectors, coRegionalDirectors, districtSupervisors, malaSenapotis] = await Promise.all([
      db.select().from(leaders).where(eq(leaders.role, "FOUNDER_ACHARYA")),
      db.select().from(leaders).where(eq(leaders.role, "GBC")),
      db.select().from(leaders).where(eq(leaders.role, "REGIONAL_DIRECTOR")),
      db.select().from(leaders).where(eq(leaders.role, "CO_REGIONAL_DIRECTOR")),
      db.select().from(leaders).where(eq(leaders.role, "DISTRICT_SUPERVISOR")),
      db.select().from(leaders).where(eq(leaders.role, "MALA_SENAPOTI"))
    ]);

    return { founder, gbc, regionalDirectors, coRegionalDirectors, districtSupervisors, malaSenapotis };
  }

  async getLeadersByLevel(level: string): Promise<Leader[]> {
    return await db.select().from(leaders).where(eq(leaders.role, level));
  }

  // Dashboard
  async getStatusDistribution(): Promise<Array<{
    statusName: string;
    count: number;
    percentage: number;
  }>> {
    const [statusCounts, totalDevotees] = await Promise.all([
      db.select({
        statusId: devotees.devotionalStatusId,
        count: count()
      }).from(devotees).groupBy(devotees.devotionalStatusId),
      db.select({ count: count() }).from(devotees)
    ]);

    const total = totalDevotees[0].count;
    const statuses = await db.select().from(devotionalStatuses);
    
    const distribution = statusCounts.map(item => {
      const status = statuses.find(s => s.id === item.statusId);
      return {
        statusName: status?.name || "Unknown",
        count: item.count,
        percentage: Math.round((item.count / total) * 100)
      };
    });

    return distribution.sort((a, b) => b.count - a.count);
  }

  async getDashboardSummary(): Promise<{
    totalDevotees: number;
    totalNamhattas: number;
    recentUpdates: Array<{
      namhattaId: number;
      namhattaName: string;
      programType: string;
      date: string;
      attendance: number;
    }>;
  }> {
    const [devoteeCount, namhattaCount, updates] = await Promise.all([
      db.select({ count: count() }).from(devotees),
      db.select({ count: count() }).from(namhattas),
      db.select().from(namhattaUpdates).orderBy(desc(namhattaUpdates.date)).limit(5)
    ]);

    const recentUpdates = [];
    for (const update of updates) {
      const namhatta = await db.select().from(namhattas).where(eq(namhattas.id, update.namhattaId)).limit(1);
      recentUpdates.push({
        namhattaId: update.namhattaId,
        namhattaName: namhatta[0]?.name || "Unknown",
        programType: update.programType,
        date: typeof update.date === 'string' ? update.date : update.date.toISOString().split('T')[0],
        attendance: update.attendance
      });
    }

    return {
      totalDevotees: devoteeCount[0].count,
      totalNamhattas: namhattaCount[0].count,
      recentUpdates
    };
  }

  // Geography - Database-based methods
  async getCountries(): Promise<string[]> {
    try {
      const results = await db
        .selectDistinct({ country: addresses.country })
        .from(addresses)
        .where(sql`${addresses.country} IS NOT NULL`);
      
      return results.map(row => row.country).filter(Boolean);
    } catch (error) {
      console.error('Error getting countries from database:', error);
      return ["India"]; // Fallback
    }
  }

  async getStates(country?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ state: addresses.stateNameEnglish })
        .from(addresses)
        .where(sql`${addresses.stateNameEnglish} IS NOT NULL`);
      
      if (country) {
        query = query.where(eq(addresses.country, country));
      }
      
      const results = await query;
      return results.map(row => row.state).filter(Boolean);
    } catch (error) {
      console.error('Error getting states from database:', error);
      return [];
    }
  }

  async getDistricts(state?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ district: addresses.districtNameEnglish })
        .from(addresses)
        .where(sql`${addresses.districtNameEnglish} IS NOT NULL`);
      
      if (state) {
        query = query.where(eq(addresses.stateNameEnglish, state));
      }
      
      const results = await query;
      return results.map(row => row.district).filter(Boolean);
    } catch (error) {
      console.error('Error getting districts from database:', error);
      return [];
    }
  }

  async getSubDistricts(district?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ subDistrict: addresses.subdistrictNameEnglish })
        .from(addresses)
        .where(sql`${addresses.subdistrictNameEnglish} IS NOT NULL`);
      
      if (district) {
        query = query.where(eq(addresses.districtNameEnglish, district));
      }
      
      const results = await query;
      return results.map(row => row.subDistrict).filter(Boolean);
    } catch (error) {
      console.error('Error getting sub-districts from database:', error);
      return [];
    }
  }

  async getVillages(subDistrict?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ village: addresses.villageNameEnglish })
        .from(addresses)
        .where(sql`${addresses.villageNameEnglish} IS NOT NULL`);
      
      if (subDistrict) {
        query = query.where(eq(addresses.subdistrictNameEnglish, subDistrict));
      }
      
      const results = await query;
      return results.map(row => row.village).filter(Boolean);
    } catch (error) {
      console.error('Error getting villages from database:', error);
      return [];
    }
  }

  async getPincodes(village?: string, district?: string, subDistrict?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ postalCode: addresses.pincode })
        .from(addresses)
        .where(sql`${addresses.pincode} IS NOT NULL`);
      
      // Apply hierarchical filtering - be more specific to reduce too many postal codes
      const conditions = [];
      
      if (village) {
        conditions.push(eq(addresses.villageNameEnglish, village));
      }
      if (subDistrict) {
        conditions.push(eq(addresses.subdistrictNameEnglish, subDistrict));
      }
      if (district) {
        conditions.push(eq(addresses.districtNameEnglish, district));
      }
      
      // Apply all conditions together for more precise filtering
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const results = await query.limit(50); // Limit to prevent too many results
      return results.map(row => row.postalCode).filter(Boolean);
    } catch (error) {
      console.error('Error getting postal codes from database:', error);
      return [];
    }
  }



  // Address Management Methods
  async findOrCreateAddress(addressData: {
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
  }): Promise<number> {
    // Normalize null/undefined values to null for proper comparison
    const normalizedData = {
      country: addressData.country || 'India',
      state: addressData.state || null,
      district: addressData.district || null,
      subDistrict: addressData.subDistrict || null,
      village: addressData.village || null,
      postalCode: addressData.postalCode || null
    };
    
    // Build exact matching conditions including null values
    const conditions = [
      eq(addresses.country, normalizedData.country),
      normalizedData.state ? eq(addresses.stateNameEnglish, normalizedData.state) : sql`${addresses.stateNameEnglish} IS NULL`,
      normalizedData.district ? eq(addresses.districtNameEnglish, normalizedData.district) : sql`${addresses.districtNameEnglish} IS NULL`,
      normalizedData.subDistrict ? eq(addresses.subdistrictNameEnglish, normalizedData.subDistrict) : sql`${addresses.subdistrictNameEnglish} IS NULL`,
      normalizedData.village ? eq(addresses.villageNameEnglish, normalizedData.village) : sql`${addresses.villageNameEnglish} IS NULL`,
      normalizedData.postalCode ? eq(addresses.pincode, normalizedData.postalCode) : sql`${addresses.pincode} IS NULL`
    ];
    
    // Try to find existing address with exact match (including nulls)
    const existingAddress = await db.select().from(addresses).where(and(...conditions)).limit(1);

    if (existingAddress[0]) {
      console.log(`Found existing address with ID: ${existingAddress[0].id}`);
      return existingAddress[0].id;
    }

    // Create new address only if no exact match found
    console.log('Creating new address record:', normalizedData);
    const result = await db.insert(addresses).values({
      country: normalizedData.country,
      stateNameEnglish: normalizedData.state,
      districtNameEnglish: normalizedData.district,
      subdistrictNameEnglish: normalizedData.subDistrict,
      villageNameEnglish: normalizedData.village,
      pincode: normalizedData.postalCode
    }).returning();
    console.log(`Created new address with ID: ${result[0].id}`);
    return result[0].id;
  }

  async createDevoteeAddress(devoteeId: number, addressId: number, addressType: string, landmark?: string): Promise<void> {
    await db.insert(devoteeAddresses).values({
      devoteeId,
      addressId,
      addressType,
      landmark
    });
  }

  async createNamhattaAddress(namhattaId: number, addressId: number, landmark?: string): Promise<void> {
    await db.insert(namhattaAddresses).values({
      namhattaId,
      addressId,
      landmark
    });
  }

  async getDevoteeAddresses(devoteeId: number): Promise<Array<{
    id: number;
    addressType: string;
    landmark?: string;
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
  }>> {
    const result = await db.select({
      id: devoteeAddresses.id,
      addressType: devoteeAddresses.addressType,
      landmark: devoteeAddresses.landmark,
      country: addresses.country,
      state: addresses.stateNameEnglish,
      district: addresses.districtNameEnglish,
      subDistrict: addresses.subdistrictNameEnglish,
      village: addresses.villageNameEnglish,
      postalCode: addresses.pincode
    }).from(devoteeAddresses)
      .innerJoin(addresses, eq(devoteeAddresses.addressId, addresses.id))
      .where(eq(devoteeAddresses.devoteeId, devoteeId));

    return result;
  }

  async getNamhattaAddress(namhattaId: number): Promise<{
    id: number;
    landmark?: string;
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
  } | undefined> {
    const result = await db.select({
      id: namhattaAddresses.id,
      landmark: namhattaAddresses.landmark,
      country: addresses.country,
      state: addresses.stateNameEnglish,
      district: addresses.districtNameEnglish,
      subDistrict: addresses.subdistrictNameEnglish,
      village: addresses.villageNameEnglish,
      postalCode: addresses.pincode
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .where(eq(namhattaAddresses.namhattaId, namhattaId))
      .limit(1);

    return result[0];
  }

  // Map data methods - Updated to use normalized address tables
  async getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>> {
    const results = await db.select({
      country: addresses.country,
      count: count()
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .innerJoin(namhattas, eq(namhattaAddresses.namhattaId, namhattas.id))
      .where(and(
        sql`${addresses.country} IS NOT NULL`,
        ne(namhattas.status, 'Rejected')
      ))
      .groupBy(addresses.country);

    return results.map(result => ({
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>> {
    let whereConditions = [
      sql`${addresses.stateNameEnglish} IS NOT NULL`,
      ne(namhattas.status, 'Rejected')
    ];
    
    if (country) {
      whereConditions.push(eq(addresses.country, country));
    }
    
    const results = await db.select({
      state: addresses.stateNameEnglish,
      country: addresses.country,
      count: count()
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .innerJoin(namhattas, eq(namhattaAddresses.namhattaId, namhattas.id))
      .where(and(...whereConditions))
      .groupBy(addresses.stateNameEnglish, addresses.country);

    return results.map(result => ({
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>> {
    let whereConditions = [
      sql`${addresses.districtNameEnglish} IS NOT NULL`,
      ne(namhattas.status, 'Rejected')
    ];
    
    if (state) {
      whereConditions.push(eq(addresses.stateNameEnglish, state));
    }
    
    const results = await db.select({
      district: addresses.districtNameEnglish,
      state: addresses.stateNameEnglish,
      country: addresses.country,
      count: count()
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .innerJoin(namhattas, eq(namhattaAddresses.namhattaId, namhattas.id))
      .where(and(...whereConditions))
      .groupBy(addresses.districtNameEnglish, addresses.stateNameEnglish, addresses.country);

    return results.map(result => ({
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>> {
    let whereConditions = [
      sql`${addresses.subdistrictNameEnglish} IS NOT NULL`,
      ne(namhattas.status, 'Rejected')
    ];
    
    if (district) {
      whereConditions.push(eq(addresses.districtNameEnglish, district));
    }
    
    const results = await db.select({
      subDistrict: addresses.subdistrictNameEnglish,
      district: addresses.districtNameEnglish,
      state: addresses.stateNameEnglish,
      country: addresses.country,
      count: count()
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .innerJoin(namhattas, eq(namhattaAddresses.namhattaId, namhattas.id))
      .where(and(...whereConditions))
      .groupBy(addresses.subdistrictNameEnglish, addresses.districtNameEnglish, addresses.stateNameEnglish, addresses.country);

    return results.map(result => ({
      subDistrict: result.subDistrict || 'Unknown',
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>> {
    let whereConditions = [
      sql`${addresses.villageNameEnglish} IS NOT NULL`,
      ne(namhattas.status, 'Rejected')
    ];
    
    if (subDistrict) {
      whereConditions.push(eq(addresses.subdistrictNameEnglish, subDistrict));
    }
    
    const results = await db.select({
      village: addresses.villageNameEnglish,
      subDistrict: addresses.subdistrictNameEnglish,
      district: addresses.districtNameEnglish,
      state: addresses.stateNameEnglish,
      country: addresses.country,
      count: count()
    }).from(namhattaAddresses)
      .innerJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .innerJoin(namhattas, eq(namhattaAddresses.namhattaId, namhattas.id))
      .where(and(...whereConditions))
      .groupBy(addresses.villageNameEnglish, addresses.subdistrictNameEnglish, addresses.districtNameEnglish, addresses.stateNameEnglish, addresses.country);

    return results.map(result => ({
      village: result.village || 'Unknown',
      subDistrict: result.subDistrict || 'Unknown',
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getAddressByPincode(pincode: string): Promise<{
    country: string;
    state: string;
    district: string;
    subDistricts: string[];
    villages: string[];
  } | null> {
    try {
      // Use raw SQL query with proper Drizzle syntax
      const result = await db.execute(
        sql`SELECT 
          country,
          state_name_english as state,
          district_name_english as district,
          subdistrict_name_english as subdistrict,
          village_name_english as village
        FROM addresses 
        WHERE pincode = ${pincode}`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      // Get the first row for country, state, district (they should all be the same for a pincode)
      const firstRow = result.rows[0] as any;
      const country = firstRow.country;
      const state = firstRow.state;
      const district = firstRow.district;

      // Extract unique sub-districts and villages
      const subDistricts = Array.from(new Set(
        result.rows
          .map((row: any) => row.subdistrict)
          .filter(Boolean)
      ));
      
      const villages = Array.from(new Set(
        result.rows
          .map((row: any) => row.village)
          .filter(Boolean)
      ));

      return {
        country: country || 'India',
        state: state || '',
        district: district || '',
        subDistricts,
        villages,
      };
    } catch (error) {
      console.error('Error in getAddressByPincode:', error);
      return null;
    }
  }
}