from app.core.ssrf import is_safe_url


def test_blocks_internal_and_bad_scheme() -> None:
    assert not is_safe_url("http://127.0.0.1/x")
    assert not is_safe_url("http://10.0.0.5/x")
    assert not is_safe_url("http://192.168.1.1/x")
    assert not is_safe_url("http://169.254.169.254/latest/meta-data")
    assert not is_safe_url("http://[::1]/x")
    assert not is_safe_url("ftp://8.8.8.8/x")
    assert not is_safe_url("file:///etc/passwd")
    assert not is_safe_url("http:///nohost")


def test_allows_public_ip_literals() -> None:
    assert is_safe_url("http://8.8.8.8/data")
    assert is_safe_url("https://93.184.216.34/")
