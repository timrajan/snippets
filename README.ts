// TODO: confirm whether created_at holds UTC or local.
// Using UtcNow because Npgsql rejected Kind=Local, but schema reports
// timestamp without time zone — these disagree. Verify before go-live.
var cutoff = DateTime.UtcNow.AddHours(-1);
