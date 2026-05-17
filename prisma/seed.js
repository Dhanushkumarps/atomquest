"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var DATABASE_URL = process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0";
var pool = new pg_1.Pool({ connectionString: DATABASE_URL });
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, manager, employee, admin, employee2, now, cycle, goalData, goals, goal2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Seeding database...");
                    // Clean up
                    return [4 /*yield*/, prisma.auditLog.deleteMany()];
                case 1:
                    // Clean up
                    _a.sent();
                    return [4 /*yield*/, prisma.checkin.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.achievement.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.goal.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.cycle.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.escalationRule.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("demo123", 10)];
                case 8:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "manager@demo.com",
                                name: "Priya Sharma",
                                password: hashedPassword,
                                role: "MANAGER",
                                department: "Engineering",
                            },
                        })];
                case 9:
                    manager = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "employee@demo.com",
                                name: "Arjun Mehta",
                                password: hashedPassword,
                                role: "EMPLOYEE",
                                department: "Engineering",
                                managerId: manager.id,
                            },
                        })];
                case 10:
                    employee = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "admin@demo.com",
                                name: "Kavita Reddy",
                                password: hashedPassword,
                                role: "ADMIN",
                                department: "HR",
                            },
                        })];
                case 11:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "employee2@demo.com",
                                name: "Rahul Singh",
                                password: hashedPassword,
                                role: "EMPLOYEE",
                                department: "Engineering",
                                managerId: manager.id,
                            },
                        })];
                case 12:
                    employee2 = _a.sent();
                    console.log("✅ Users created");
                    now = new Date();
                    return [4 /*yield*/, prisma.cycle.create({
                            data: {
                                name: "FY2025-26",
                                goalSettingStart: new Date("2025-04-01"),
                                goalSettingEnd: new Date("2025-04-30"),
                                q1Start: new Date("2025-04-01"),
                                q1End: new Date("2026-06-30"), // Extended to include now for demo
                                q2Start: new Date("2026-07-01"),
                                q2End: new Date("2026-09-30"),
                                q3Start: new Date("2026-10-01"),
                                q3End: new Date("2026-12-31"),
                                q4Start: new Date("2027-01-01"),
                                q4End: new Date("2027-03-31"),
                                isActive: true,
                            },
                        })];
                case 13:
                    cycle = _a.sent();
                    console.log("✅ Cycle created");
                    goalData = [
                        {
                            thrustArea: "Revenue Growth",
                            title: "Achieve Q4 Revenue Target of ₹50L",
                            description: "Drive sales efforts to achieve the quarterly revenue target of ₹50 lakhs through strategic client acquisition and upselling.",
                            uom: "NUMERIC_MIN",
                            target: 50,
                            weightage: 25,
                        },
                        {
                            thrustArea: "Customer Success",
                            title: "Maintain NPS Score above 70",
                            description: "Ensure customer satisfaction by maintaining Net Promoter Score above 70 through proactive support and engagement.",
                            uom: "NUMERIC_MIN",
                            target: 70,
                            weightage: 20,
                        },
                        {
                            thrustArea: "Product Delivery",
                            title: "Reduce Feature Delivery TAT to 5 days",
                            description: "Improve engineering efficiency by reducing the average time-to-deliver new features from current 8 days to 5 days.",
                            uom: "NUMERIC_MAX",
                            target: 5,
                            weightage: 20,
                        },
                        {
                            thrustArea: "Quality",
                            title: "Achieve Zero Critical Production Bugs",
                            description: "Maintain zero critical production incidents through improved testing processes and code review standards.",
                            uom: "ZERO",
                            target: 0,
                            weightage: 20,
                        },
                        {
                            thrustArea: "Learning & Development",
                            title: "Complete Cloud Architecture Certification",
                            description: "Obtain AWS Solutions Architect certification to upskill in cloud technologies and improve team capabilities.",
                            uom: "TIMELINE",
                            target: 1,
                            weightage: 15,
                        },
                    ];
                    return [4 /*yield*/, Promise.all(goalData.map(function (g) {
                            return prisma.goal.create({
                                data: __assign(__assign({}, g), { userId: employee.id, cycleId: cycle.id, status: "LOCKED", lockedAt: new Date("2025-05-01") }),
                            });
                        }))];
                case 14:
                    goals = _a.sent();
                    console.log("✅ Goals created");
                    // Q1 achievements for 3 goals
                    return [4 /*yield*/, prisma.achievement.create({
                            data: {
                                goalId: goals[0].id,
                                quarter: "Q1",
                                actual: 42,
                                status: "ON_TRACK",
                                progressScore: (42 / 50) * 100, // 84%
                            },
                        })];
                case 15:
                    // Q1 achievements for 3 goals
                    _a.sent();
                    return [4 /*yield*/, prisma.achievement.create({
                            data: {
                                goalId: goals[1].id,
                                quarter: "Q1",
                                actual: 75,
                                status: "COMPLETED",
                                progressScore: (75 / 70) * 100, // 107% (capped at 150)
                            },
                        })];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, prisma.achievement.create({
                            data: {
                                goalId: goals[2].id,
                                quarter: "Q1",
                                actual: 6,
                                status: "ON_TRACK",
                                progressScore: (5 / 6) * 100, // 83.3%
                            },
                        })];
                case 17:
                    _a.sent();
                    console.log("✅ Achievements created");
                    // Manager check-in
                    return [4 /*yield*/, prisma.checkin.create({
                            data: {
                                goalId: goals[0].id,
                                managerId: manager.id,
                                quarter: "Q1",
                                comment: "Great progress on revenue! 84% achievement in Q1 is on track. Keep up the client acquisition momentum.",
                            },
                        })];
                case 18:
                    // Manager check-in
                    _a.sent();
                    console.log("✅ Check-in created");
                    // Audit logs
                    return [4 /*yield*/, prisma.auditLog.create({
                            data: {
                                entityType: "Goal",
                                entityId: goals[0].id,
                                userId: manager.id,
                                action: "APPROVE",
                                oldValue: { status: "SUBMITTED" },
                                newValue: { status: "LOCKED" },
                            },
                        })];
                case 19:
                    // Audit logs
                    _a.sent();
                    return [4 /*yield*/, prisma.auditLog.create({
                            data: {
                                entityType: "Goal",
                                entityId: goals[1].id,
                                userId: admin.id,
                                action: "UNLOCK",
                                oldValue: { status: "LOCKED" },
                                newValue: { status: "APPROVED" },
                            },
                        })];
                case 20:
                    _a.sent();
                    console.log("✅ Audit logs created");
                    return [4 /*yield*/, prisma.goal.create({
                            data: {
                                thrustArea: "Revenue Growth",
                                title: "Increase Sales Pipeline by 40%",
                                description: "Build and manage sales pipeline to achieve 40% growth QoQ through targeted outreach.",
                                uom: "NUMERIC_MIN",
                                target: 40,
                                weightage: 50,
                                userId: employee2.id,
                                cycleId: cycle.id,
                                status: "SUBMITTED",
                            },
                        })];
                case 21:
                    goal2 = _a.sent();
                    return [4 /*yield*/, prisma.goal.create({
                            data: {
                                thrustArea: "Customer Success",
                                title: "Achieve 95% Customer Retention Rate",
                                description: "Maintain customer retention rate at 95% or above through proactive engagement.",
                                uom: "NUMERIC_MIN",
                                target: 95,
                                weightage: 50,
                                userId: employee2.id,
                                cycleId: cycle.id,
                                status: "SUBMITTED",
                            },
                        })];
                case 22:
                    _a.sent();
                    console.log("✅ Employee 2 goals (submitted) created");
                    // Escalation rule
                    return [4 /*yield*/, prisma.escalationRule.create({
                            data: {
                                trigger: "CHECKIN_OVERDUE",
                                daysThreshold: 7,
                                notifyEmployee: true,
                                notifyManager: true,
                                notifyHR: false,
                                isActive: true,
                            },
                        })];
                case 23:
                    // Escalation rule
                    _a.sent();
                    return [4 /*yield*/, prisma.escalationRule.create({
                            data: {
                                trigger: "MANAGER_NOT_APPROVED",
                                daysThreshold: 5,
                                notifyEmployee: false,
                                notifyManager: true,
                                notifyHR: true,
                                isActive: true,
                            },
                        })];
                case 24:
                    _a.sent();
                    console.log("✅ Escalation rules created");
                    console.log("\n🎉 Seed complete! Demo accounts:");
                    console.log("   employee@demo.com / demo123 (EMPLOYEE)");
                    console.log("   manager@demo.com  / demo123 (MANAGER)");
                    console.log("   admin@demo.com    / demo123 (ADMIN)");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
