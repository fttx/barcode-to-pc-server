export class Utils {
    public static IsDev() {
        return process.argv.slice(1).some(val => val === '--dev');
    }
}
