import BaseModel from "./base.js";
import { toUrlFriendly } from "../utils";


export default class SchoolModel extends BaseModel {
    constructor(db) {
        super(db, 'schools');
    }

    async create(body) {
        const school = await super.findOne({ name: body.name });
        if (school) {
            return null;
        } else {
            const { name } = body;
            const id = await this.generateUniqueSchoolName(name);
            const newSchoolId = await super.create({ ...body, id });
            return { _id: newSchoolId, id, name };
        }
    }

    async getAllExistingNames(baseName) {
        const query = { id: { $regex: `^${baseName}`, $options: 'i' } };
        const results = await super.find(query);
        return results.map(school => school.id);
    };


   /**
   * Generates a unique URL-friendly name for a school
   * @param {string} schoolName - The original school name
   * @param {Function} getAllExistingNames - Function to get all similar existing names
   * @returns {Promise<string>} Unique URL-friendly name
   */
    async generateUniqueSchoolName(schoolName) {
        try {
            const baseName = toUrlFriendly(schoolName);
            if (!baseName) {
                throw new Error('Invalid school name');
            }

            // Get all existing names that start with baseName using a single query
            const existingNames = await this.getAllExistingNames(baseName);
            if (!existingNames.length) {
                return baseName;
            }

            // Find the highest number suffix
            let maxNumber = 0;
            existingNames.forEach(name => {
                if (name === baseName) return;
                const match = name.match(new RegExp(`^${baseName}(\\d+)$`));
                if (match) {
                    const num = parseInt(match[1], 10);
                    maxNumber = Math.max(maxNumber, num);
                }
            });

            // Generate the next available name
            const newName = maxNumber === 0 ? baseName + '1' : baseName + (maxNumber + 1);
            return newName;
        } catch (error) {
            console.error('Error generating unique school name:', error);
            throw error;
        }
    };
}