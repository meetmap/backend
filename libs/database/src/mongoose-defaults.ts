import * as mongoose from 'mongoose';

mongoose.set('toObject', { virtuals: true });
mongoose.set('toJSON', { virtuals: true });
