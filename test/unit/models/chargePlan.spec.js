import ChargePlanModel from '../../../models/chargePlan';
import SchoolModel from '../../../models/school';
import { ChargeStatus } from '../../../const';
import { generateOccurrence, getInvoiceDate } from '../../../utils/scheduler';

jest.mock('../../../models/school');
jest.mock('../../../utils/scheduler');

describe('ChargePlanModel', () => {
    let db;
    let chargePlanModel;
    let schoolModelInstance;

    beforeEach(() => {
        db = {
            collection: jest.fn().mockReturnValue({
                insertOne: jest.fn().mockResolvedValue({ insertedId: 'newChargePlanId' }),
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn(),
                }),
            }),
        };
        chargePlanModel = new ChargePlanModel(db);
        schoolModelInstance = {
            findById: jest.fn(),
        };
        SchoolModel.mockImplementation(() => schoolModelInstance);
    });

    describe('batchCreate', () => {
        it('should create one-time charge plans', async () => {
            const body = {
                students: [
                    { _id: 'student1', firstName: 'John', lastName: 'Doe', payingContact: { _id: 'contact1' } },
                ],
                chargeTemplates: [
                    { _id: 'template1' },
                ],
                occurrenceType: 'one-time',
                invoiceTimestamp: new Date().getTime(),
            };
            const headers = { schoolid: 'school1' };
            const school = {
                _id: 'school1',
                paymentSettings: {
                    recurringPeriod: 'monthly',
                    recurringMonthday: 5,
                    gracePeriod: 10,
                },
            };
            const invoiceDate = new Date().getTime();

            schoolModelInstance.findById.mockResolvedValue(school);
            getInvoiceDate.mockReturnValue(invoiceDate);
            chargePlanModel.create = jest.fn().mockResolvedValue('newChargePlanId');

            const result = await chargePlanModel.batchCreate(db, body, headers);

            expect(schoolModelInstance.findById).toHaveBeenCalledWith(headers.schoolid);
            expect(getInvoiceDate).toHaveBeenCalledWith(body.invoiceTimestamp, 5, 'monthly');
            // expect(chargePlanModel.create).toHaveBeenCalledWith(expect.objectContaining({
            //     student: { _id: 'student1', firstName: 'John', lastName: 'Doe' },
            //     payingContact: { _id: 'contact1' },
            //     school: { _id: 'school1' },
            //     chargeTemplate: { _id: 'template1', inLibrary: true },
            //     occurrenceType: 'one-time',
            //     invoiceTimestamp: invoiceDate,
            // }));
            expect(result).toEqual([{
                chargePlanId: 'newChargePlanId',
                student: { _id: 'student1', firstName: 'John', lastName: 'Doe' },
                payingContact: { _id: 'contact1' },
                school: { _id: 'school1' },
                chargeTemplate: { _id: 'template1', inLibrary: true },
                occurrenceType: 'one-time',
                invoiceTimestamp: invoiceDate,
                status: ChargeStatus.NEW,
            }]);
        });

        it('should create recurring charge plans', async () => {
            const body = {
                students: [
                    { _id: 'student1', firstName: 'John', lastName: 'Doe', payingContact: { _id: 'contact1' } },
                ],
                chargeTemplates: [
                    { _id: 'template1' },
                ],
                occurrenceType: 'recurring',
                startTimestamp: new Date().getTime(),
                endTimestamp: new Date().getTime() + 1000000,
            };
            const headers = { schoolid: 'school1' };
            const school = {
                _id: 'school1',
                paymentSettings: {
                    recurringPeriod: 'monthly',
                    recurringMonthday: 5,
                    gracePeriod: 10,
                },
            };
            const dates = [new Date(), new Date(new Date().getTime() + 1000000)];

            schoolModelInstance.findById.mockResolvedValue(school);
            generateOccurrence.mockReturnValue(dates);
            chargePlanModel.create = jest.fn().mockResolvedValue('newChargePlanId');

            const result = await chargePlanModel.batchCreate(db, body, headers);

            expect(schoolModelInstance.findById).toHaveBeenCalledWith(headers.schoolid);
            expect(generateOccurrence).toHaveBeenCalledWith('monthly', 5, body.startTimestamp, body.endTimestamp);
            // expect(chargePlanModel.create).toHaveBeenCalledWith(expect.objectContaining({
            //     student: { _id: 'student1', firstName: 'John', lastName: 'Doe' },
            //     payingContact: { _id: 'contact1' },
            //     school: { _id: 'school1' },
            //     chargeTemplate: { _id: 'template1', inLibrary: true },
            //     occurrenceType: 'recurring',
            //     startTimestamp: body.startTimestamp,
            //     endTimestamp: body.endTimestamp,
            // }));
            expect(result).toEqual([
                {
                    student: { _id: 'student1', firstName: 'John', lastName: 'Doe' },
                    payingContact: { _id: 'contact1' },
                    school: { _id: 'school1' },
                    chargeTemplate: { _id: 'template1', inLibrary: true },
                    occurrenceType: 'recurring',
                    startTimestamp: body.startTimestamp,
                    endTimestamp: body.endTimestamp,
                    chargePlanId: 'newChargePlanId',
                    invoiceTimestamp: dates[0].getTime(),
                    status: ChargeStatus.NEW,
                },
                {
                    student: { _id: 'student1', firstName: 'John', lastName: 'Doe' },
                    payingContact: { _id: 'contact1' },
                    school: { _id: 'school1' },
                    chargeTemplate: { _id: 'template1', inLibrary: true },
                    occurrenceType: 'recurring',
                    startTimestamp: body.startTimestamp,
                    endTimestamp: body.endTimestamp,
                    chargePlanId: 'newChargePlanId',
                    invoiceTimestamp: dates[1].getTime(),
                    status: ChargeStatus.NEW,
                },
            ]);
        });
    });
});
