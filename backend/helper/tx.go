package helper

import "database/sql"

func CommitOrRollBack(tx *sql.Tx){
	err := recover()
	if err != nil {
		_ = tx.Rollback()
		panic(err)
	} else {
		_ = tx.Commit()
	}
}