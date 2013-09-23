<?php

$myUrl = $_POST['url-to-sign'];
$baseUrl = $_POST['base-url'];
$cryptoKey = "<YOUR_KEY_HERE>";
$hashedResult = hash_hmac('sha1', $myUrl, $decodedKey);
echo signUrl($myUrl, $cryptoKey);

// Encode a string to URL-safe base64
function encodeBase64UrlSafe($value)
{
  return str_replace(array('+', '/'), array('-', '_'),
    base64_encode($value));
}

// Decode a string from URL-safe base64
function decodeBase64UrlSafe($value)
{
  return base64_decode(str_replace(array('-', '_'), array('+', '/'),
    $value));
}

function signUrl($myUrlToSign, $privateKey)
{
  // parse the url
  $url = parse_url($myUrlToSign);

  $urlPartToSign = $url['path'] . "?" . $url['query'];

  // Decode the private key into its binary format
  $decodedKey = decodeBase64UrlSafe($privateKey);

  // Create a signature using the private key and the URL-encoded
  // string using HMAC SHA1. This signature will be binary.
  $signature = hash_hmac("sha1",$urlPartToSign, $decodedKey,  true);

  $encodedSignature = encodeBase64UrlSafe($signature);

  return $myUrlToSign."&signature=".$encodedSignature;
}


?>