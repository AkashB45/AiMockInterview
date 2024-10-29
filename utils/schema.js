import { pgTable,serial,text,varchar } from "drizzle-orm/pg-core";

export const mockInterview = pgTable('mockInterview', {
    id:serial('id').primaryKey(),
    jsonMockRep:text('jsonMockRep').notNull(),
    jobPosition:varchar('jobPosition').notNull(),
    jobDesc:varchar('jobDesc').notNull(),
    jobExper:varchar('jobExper').notNull(), 
    createdBy:varchar('createdBy').notNull(),
    createdAt:varchar('createdAt'),
    mockId:varchar('mockId').notNull(),   
  });

export const UserAnswers = pgTable('UserAnswer', {
    id:serial('id').primaryKey(),
    mockIdRef:varchar('mockId').notNull(),
    question:varchar('question').notNull(),
    correctAns:varchar('correctAns'),
    userAns:varchar("userAns"),
    feedback:varchar("feedback"),
    rating:varchar("rating"),
    userEmail:varchar("userEmail"),
    createdAt:varchar('createdAt'),
  });