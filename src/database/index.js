import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/agenda-de-compromissos');
mongoose.Promise = global.Promise;

export default mongoose;
