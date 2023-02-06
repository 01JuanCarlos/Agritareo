package cache

import (
	"github.com/allegro/bigcache"
	"ns-api/modules/log"
	"time"
)

var (
	cache *bigcache.BigCache
)

func init() {
	var err error
	config := bigcache.Config{
		Shards:             1024,
		LifeWindow:         60 * time.Minute,
		CleanWindow:        5 * time.Minute,
		MaxEntriesInWindow: 1000 * 10 * 60,
		MaxEntrySize:       500,
		Verbose:            true,
		HardMaxCacheSize:   8192,
		OnRemove:           nil,
		OnRemoveWithReason: nil,
	}

	cache, err = bigcache.NewBigCache(config)

	if nil != err {
		log.Fatal(err.Error())
	}
}

func Get(key string) ([]byte, error) {
	return cache.Get(key)
}

func Set(key string, value []byte) error {
	return cache.Set(key, value)
}

func Has(key string) bool {
	_, err := Get(key)
	return nil == err
}
